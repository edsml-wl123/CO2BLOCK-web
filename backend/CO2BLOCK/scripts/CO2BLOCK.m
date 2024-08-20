% This tool provides estimate of the CO2 storage capacity of a geological
% reservoir under different scenarios of well number and distance.
% Wells are placed into a grid configuration with equal number of rows and 
% columns, or with number of row and columns that differ by 1.

% Please, read the file README and the User Guide for instructions.
% This software is free. Please cite CO2BLOCK as:
%   https://github.com/co2block/CO2BLOCK 
% De Simone and Krevor (2021).  A tool for first order estimates and optimisation of dynamic storage resource capacity in saline aquifers”. International Journal of Greenhouse Gas Control, 106, 103258.

function CO2BLOCK(varargin)    
    %%%%%%  INPUT DATA %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    %-- data file directory and name
    % fpath = './';                         % directory of the input data file
    % fname = 'example_data.xlsx';        % name of the input data file
    %--
    % Input parsing
    % Input parsing

    if nargin < 10
        error('Insufficient input arguments.');
    end

    fpath = varargin{1};                         % directory of the input data file
    fname = varargin{2};        % name of the input data file
    correction = varargin{3};
    dist_min = str2double(varargin{4});
    dist_max = varargin{5};
    if ~strcmp(dist_max, 'auto')
        dist_max = str2double(dist_max);
    end

    nr_dist = str2double(varargin{6});
    nr_well_max = varargin{7};
    if ~strcmp(nr_well_max, 'auto')
        nr_well_max = str2double(nr_well_max);
    end

    rw = str2double(varargin{8});
    time_yr = str2double(varargin{9});
    maxQ = str2double(varargin{10});

%%%%%%%%%%% END OF INPUT DATA  %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    % Display parameters
    disp(['Correction: ', correction]);
    disp(['Minimum Inter-Well Distance: ', num2str(dist_min), ' km']);
    disp(['Maximum Inter-Well Distance: ', num2str(dist_max), ' km']);
    disp(['Number of Distances: ', num2str(nr_dist)]);
    disp(['Maximum Number of Wells: ', num2str(nr_well_max)]);
    disp(['Well Radius: ', num2str(rw), ' m']);
    disp(['Time of Injection: ', num2str(time_yr), ' years']);
    disp(['Maximum Injection Rate: ', num2str(maxQ)]);

    %%
    %calculate
    [d_list,well_list,d_max,Q_M_each,V_M,Table_Q,Table_V,p_sup_vec] = calculate(fpath,fname,correction,dist_min,...
    dist_max,nr_dist,nr_well_max,rw,time_yr,maxQ);


    %%    
    %%%%%%%%%   PLOTS  %%%%%%%%%%%%%%%%%%%%  
    set(groot,'defaulttextinterpreter','latex');  
    set(groot, 'defaultAxesTickLabelInterpreter','latex');  
    set(groot, 'defaultLegendInterpreter','latex');


    figure1 = figure('Visible', 'off');   % sustainable per well flow-rate Q_M_each
    if ~isgraphics(figure1, 'figure')
        error('Failed to create figure1.');
    end
    [C,h] = contour(d_list, well_list,real(Q_M_each),'color', [.6 .6 .6], 'linewidth', 1);  hold on; 
    clabel(C,h, 'Fontsize', 12, 'FontWeight','bold', 'color',[.6 .6 .6]);  
    plot(d_max, well_list,'linewidth',2,'color','r'); 
    set(gca,'FontSize',12);
    xlim([min(d_list),max(d_list)]);
    title('Maximum sustainable per well flow-rate $Q_{M}$ (Mt/yr) ', 'Fontsize',16);
    xlabel('inter-well distance $d$ (km)','Fontsize',18); 
    ylabel('number of wells $n$','Fontsize',18); hold off;

    figure2 = figure('Visible', 'off');   % sustainable storage capacity V_M
    if ~isgraphics(figure2, 'figure')
        error('Failed to create figure2.');
    end
    levels_nr = 20; %logspace(log(0.1),log(max(V_M(:))),15);
    [C,h] = contour(d_list, well_list,real(V_M),levels_nr,'color', [.6 .6 .6], 'linewidth', 1);  hold on;  
    h.LevelList=round(h.LevelList,2) ;
    clabel(C,h, 'Fontsize', 12, 'FontWeight','bold', 'color',[.6 .6 .6]);
    plot(d_max, well_list,'linewidth',2,'color','r'); 
    set(gca,'FontSize',12);
    xlim([min(d_list),max(d_list)]);
    title('Maximum sustainable storage $V_{M}$ (Gt) ', 'Fontsize',16);
    xlabel('inter-well distance $d$ (km)','Fontsize',18); 
    ylabel('number of wells $n$','Fontsize',18); hold off;

    %% 
    %%%%%%%%%%%%%%%%%%%%  Save results  %%%%%%%%%%%%%%%%%%%% 
    outputDir = 'output';
    if ~exist(outputDir, 'dir')
        mkdir(outputDir);
    end

    saveas(figure1, fullfile(outputDir, 'MaxFlowRatePerWell.png'));
    saveas(figure2, fullfile(outputDir, 'MaxSustainableStorage.png'));
    writetable(Table_Q,fullfile(outputDir,'Q_M_max_per_well_inj_rate.xls'), 'WriteRowNames',true);
    writetable(Table_V,fullfile(outputDir,'V_M_max_storage_capacity.xls'), 'WriteRowNames',true);
end