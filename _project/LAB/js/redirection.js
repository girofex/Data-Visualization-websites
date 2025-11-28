function handleButtonClick(destination, openInNewWindow) {
    setTimeout(function() {
        if(openInNewWindow){
            if(destination)
                window.open(destination, '_blank');
        }
        
        else
            window.location.href = destination;
    }, 200);
}