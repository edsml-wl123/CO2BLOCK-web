// created by Wenxin Li, github name wl123

// Get the newest url of image to display on the page
const getCacheBustedUrl = (url) => {
    return `/api/${url}?t=${new Date().getTime()}`;
};


// Download a file according to its url
const downloadFile = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = url.split('/').pop(); 
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
  };



const handleDownload = async(event, result) => {
    event.preventDefault();
    event.stopPropagation();

    if (result) 
        await downloadFile(`/api/${result}`);  // append '/api' prefix to url to make requests to backend
  };


  export {getCacheBustedUrl, downloadFile, handleDownload};
