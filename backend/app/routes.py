# created by Wenxin Li, github name wl123
#
# app/routes.py
from flask import Blueprint, jsonify, request, render_template, send_from_directory, url_for, current_app
import pandas as pd
from copy import deepcopy
import subprocess
import matplotlib.pyplot as plt
import os
import json

bp = Blueprint('routes', __name__)

project_dir = os.getcwd()  # get absolute path of the current directory
with open('config.json', 'r') as file:  # read config from file
    settings = json.load(file)
    exec_path = os.path.join(project_dir, settings['exec_path'])
    reservoir_data = os.path.join(project_dir, settings['reservoir_data_path'])
    data_dir = os.path.join(project_dir, settings['data_path'])
    outputs_dir = os.path.join(project_dir, settings['outputs_dir'])
    outputs = settings['output_name']
    optimize_path = os.path.join(project_dir, outputs_dir, settings['optimize_name'])
    optimize_output = settings['optimize_name']

fpath = project_dir
fname = 'temp.xlsx'  # the temporary file to save inputs

# Define global variables
entered_inputs, entered_limits, optimize_inputs = {}, {}, None


@bp.route('/', methods=['GET'])
def home():
    return 'Backend Server'


# The route for sending data of UK offshore reservoirs
@bp.route('/reservoirs', methods=['GET'])
def send_reservoirs():
    reservoirs = pd.read_excel(reservoir_data, sheet_name='UK_data')
    reservoirs = reservoirs.to_json(orient='records')

    if reservoirs:
        return reservoirs
    else:
        return jsonify({"error": "Reservoir not found"}), 404


# The route for save model parameters from entered inputs or selected unit
@bp.route('/save-inputs', methods=['POST'])
def save_inputs():
    if os.path.exists(os.path.join(fpath, fname)):
        try:
            os.path.join(fpath, fname)
        except Exception as e:
            print(e)

    inputs = request.get_json()
    global entered_inputs
    entered_inputs = deepcopy(inputs)

    df = pd.DataFrame([inputs])
    columns = ['name', 'domainType', 'minDepth', 'meanDepth', 'thickness', 'area', 'meanPermeability',
               'meanPorosity', 'rockCompressibility', 'waterCompressibility', 'co2Density', 'co2Viscosity',
               'waterViscosity', 'porePressure', 'meanPressure', 'meanTemperature', 'brineSalinity',
               'principalStress', 'stressRatio', 'frictionCoefficient', 'cohesion', 'tensileStrength']
    df = df[columns]

    for column in columns:
        if column in ['name', 'domainType']:
            continue

        value = df[column][0]
        if not value:
            df[column][0] = 0.0
        else:
            df[column][0] = float(value)
    print(df)
    df.to_excel(os.path.join(fpath, fname), index=False)  # write the inputs to the temporary file
    return 'backend received inputs', 201


# The route to run the CO2BLOCK executable
@bp.route('/model/enter-inputs/run', methods=['POST'])
@bp.route('/model/map/run', methods=['POST'])
def run_model():
    for output in outputs:
        if os.path.exists(outputs_dir + output):
            try:
                os.remove(outputs_dir + output)
            except Exception as e:
                print(e)

    limits = request.get_json()
    global entered_limits
    entered_limits = deepcopy(limits)
    result = run_executable(correction=entered_limits['correction'], time_yr=entered_limits['injectionTime'],
                            dist_min=entered_limits['minDistance'], dist_max=entered_limits['maxDistance'],
                            nr_dist=entered_limits['numDistance'], nr_well_max=entered_limits['maxWellNum'],
                            rw=entered_limits['wellRadius'], maxQ=entered_limits['maxQ'])
    if result != 0:
        return result, 201
    return 'CO2BLOCK ran successfully', 201


# Run CO2BLOCK executable
def run_executable(correction, dist_min, dist_max, nr_dist, nr_well_max, rw, time_yr, maxQ):
    result = ''
    try:
        result = subprocess.run([exec_path, fpath, fname, correction, dist_min, dist_max, nr_dist, nr_well_max, rw,
                                 time_yr, maxQ], capture_output=True, text=True, encoding='utf-8')

        if result.returncode != 0:
            raise Exception(result.stderr)
    except Exception as e:
        print(e)

    if result.returncode != 0:
        return 'returncode:' + str(result.returncode) + '\n' + result.stderr
    else:
        print(result.stdout)
    return 0


# The route to send the urls of generated outputs to the frontend
@bp.route('/model/results', methods=['GET'])
def get_results():
    outputs_urls = [url_for('routes.serve_output', filename=output) for output in outputs]
    return jsonify(outputs_urls)


# Serve outputs urls from the outputs directory
@bp.route('/model/results/<filename>')
def serve_output(filename):
    return send_from_directory(outputs_dir, filename)


# The route to send data including distance, well number, flow rate of maximum storage scenario
@bp.route('/model/maxScenario', methods=['GET'])
def get_max_scenario():
    df = pd.read_excel(outputs_dir + outputs[3])
    df_value = df.iloc[:, 1:]

    max_value = df_value.max().max()
    max_location = df_value.stack().idxmax()

    row_header = df.iloc[max_location[0], 0]
    column_header = max_location[1]
    column_index = df.columns.get_loc(column_header)
    wellNum = int(row_header)
    wellDistance = int(column_header.split('_')[4])

    df = pd.read_excel(outputs_dir + outputs[2])
    flowRate = float(df.iloc[max_location[0], column_index])
    return {"maxStorage": max_value, "wellNum": wellNum, "wellDistance": wellDistance, "flowRate": flowRate}


# The route to calculate revenue
@bp.route('/optimize/run', methods=['POST'])
def revenue_optimization():
    if os.path.exists(optimize_path):
        try:
            os.remove(optimize_path)
        except Exception as e:
            print(e)

    readOutputs, rates = request.get_json()['readOutputs'], request.get_json()['rates']
    capture_cost_rate, transport_cost_rate = rates['capture_cost'], rates['transport_cost']
    revenue_rates = rates['revenue']

    # Read outputs from model execution on the interface
    if readOutputs:
        well_num = max_storage_each_wellNum()
        try:
            temp = pd.read_excel(os.path.join(fpath, fname))
            name = str(temp['name'][0])
            if (name == '') | (name is None) | (name == 'nan'):
                name = 'Unknown'
        except Exception as e:
            name = 'Unknown'
    else:
        well_num = max_storage_each_wellNum(None)
        name = 'Unknown'

    # Compute overall cost
    costs = cost_calculation(well_num, capture_rate=capture_cost_rate, transport_rate=transport_cost_rate)

    # Compute net revenues with different rates
    revenues, well_nums = [], []
    for rate in revenue_rates:
        revenue, wellNum = [], []
        for dic in costs:
            well_num, storage, cost = dic['wellNum'], dic['maxStorage'], dic['cost']
            revenue.append((storage * rate * 1000000 - cost) / 100000)
            wellNum.append(well_num)
        revenues.append(revenue)
        well_nums.append(wellNum)

    # Draw the plot depicting net revenue
    plt.figure(figsize=(8, 6))
    colors = ['blue', 'maroon', 'orange', 'purple', 'green', 'navy', 'darkgreen', 'red', 'pink', 'magenta']
    for i in range(len(revenue_rates)):
        plt.plot(well_nums[i], revenues[i], label=f'Revenue = {revenue_rates[i]}€/tCO2', color=colors[i])

    plt.axhline(0, color='black', linestyle='--')
    plt.xlabel('Number of wells, n')
    plt.ylabel('Revenue - Investment (G€)')
    plt.title(name)
    plt.legend()
    plt.tight_layout()
    plt.savefig(optimize_path)  # save the plot locally in the outputs directory
    return 'backend received rates', 201


# Read maximum storage under each well number from model outputs or uploaded file
def max_storage_each_wellNum(max_storage_file=outputs_dir + outputs[3]):
    if max_storage_file is None:
        global optimize_inputs
        df = deepcopy(optimize_inputs)
    else:
        df = pd.read_excel(max_storage_file)

    well_num_storage = []
    for i in range(len(df)):
        well_num = df['number_of_wells'][i]
        max_storage = df.iloc[:, 1:].iloc[i].max()
        if (max_storage == 0) | (max_storage is None) | (max_storage == ""): continue
        well_num_storage.append({'wellNum': well_num, 'maxStorage': max_storage})
    return well_num_storage


# Calculate overall cost
def cost_calculation(well_num_storage, capture_rate=50, transport_rate=8):
    costs = []
    df = pd.read_excel(os.path.join(fpath, fname))
    drilling_cost = float(df['meanDepth'][0]) * 26
    for pairs in well_num_storage:
        well_num, storage = pairs['wellNum'], pairs['maxStorage']
        fixed_cost = 8200 * well_num
        surface_cost = 6120 * well_num
        site_cost = 24097
        monitor_cost = 1530
        storage_cost = (drilling_cost + fixed_cost + surface_cost + site_cost + monitor_cost) * 1.05
        capture_cost = storage * capture_rate * 1000000
        transport_cost = storage * transport_rate * 1000000
        costs.append({'wellNum': well_num, 'maxStorage': storage,
                      'cost': storage_cost + capture_cost + transport_cost})
    return costs


# The route for upload a file for revenue optimization
@bp.route('/optimize/upload', methods=['POST'])
def save_optimize_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400

    if file:
        global optimize_inputs
        optimize_inputs = pd.read_excel(file)
        return jsonify({'message': 'File successfully uploaded'}), 200


# Send the url of revenue plot to frontend
@bp.route('/optimize/result', methods=['GET'])
def get_optimize_result():
    outputs_urls = [url_for('routes.serve_optimize', filename=optimize_output)]
    return jsonify(outputs_urls)


@bp.route('/optimize/result/<filename>')
def serve_optimize(filename):
    return send_from_directory(outputs_dir, filename)


# The route for sending the urls of example files
@bp.route('/help', methods=['GET'])
def get_example():
    examples_urls = [url_for('routes.serve_example', filename=name) for name in
                     ['example_inputs.xlsx', 'example_V_M.xls']]
    return jsonify(examples_urls)


# Send the urls of example files from data directory
@bp.route('/help/<filename>')
def serve_example(filename):
    return send_from_directory(data_dir, filename)
