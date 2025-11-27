function toggleNav() {
    const sidebar = document.getElementById("mySidebar");
    const overlay = document.getElementById("overlay");
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    } else {
        sidebar.classList.add('open');
        overlay.classList.add('active');
    }
}


const dropZone = document.getElementById('dropZone');

if (dropZone) {
    const MAX_FILES_LIMIT = 20;
    let convertedFilesCache = []; 
    
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const resHeader = document.getElementById('resHeader');
    const downloadAllBtn = document.getElementById('downloadAllBtn');
    const clearAllBtn = document.getElementById('clearAllBtn');
    const emptyState = document.getElementById('empty-state');

    const updateUIState = () => {
        if (convertedFilesCache.length > 0) {
            resHeader.style.display = 'flex';
            clearAllBtn.style.display = 'inline-block';
            if(emptyState) emptyState.style.display = 'none';
            
            if (convertedFilesCache.length > 1) {
                downloadAllBtn.style.display = 'inline-block';
            } else {
                downloadAllBtn.style.display = 'none';
            }
        } else {
            resHeader.style.display = 'none';
            if(emptyState) emptyState.style.display = 'block';
        }
    };

    const handleFiles = (files) => {
        if (files.length > MAX_FILES_LIMIT) {
            alert(`Please select up to ${MAX_FILES_LIMIT} files at a time.`);
            return;
        }

        if(files.length > 0) {
            setTimeout(() => {
               document.getElementById('results-area').scrollIntoView({behavior: "smooth"});
           }, 300);
        }

        Array.from(files).forEach(file => {
            if (!file.name.toLowerCase().endsWith('.heic')) {
                alert("File " + file.name + " is not a HEIC file!");
                return;
            }
            processFile(file);
        });
    };

    const processFile = (file) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'file-item';
        
        let outputFileName = file.name.replace(/\.heic$/i, '.jpg');

        itemDiv.innerHTML = `
            <div class="file-info">
                <div class="file-icon"><i class="far fa-image"></i></div>
                <span class="file-name">${file.name}</span>
            </div>
            <div class="action-area">
                <div class="loader"></div> 
                <i class="fas fa-check-circle status-done-icon"></i>
                <a href="#" class="download-btn" download="${outputFileName}">
                    Download
                </a>
            </div>
        `;
        
        fileList.insertBefore(itemDiv, fileList.firstChild); 
        
        if(emptyState) emptyState.style.display = 'none';
        resHeader.style.display = 'flex';

        const loader = itemDiv.querySelector('.loader');
        const doneIcon = itemDiv.querySelector('.status-done-icon');
        const downloadBtn = itemDiv.querySelector('.download-btn');
        const itemContainer = itemDiv;

        heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.8
        })
        .then((conversionResult) => {
            convertedFilesCache.push({
                name: outputFileName,
                blob: conversionResult
            });
            
            updateUIState();

            loader.style.display = 'none';
            doneIcon.style.display = 'inline-block';
            itemContainer.style.borderLeftColor = "#27ae60";

            const url = URL.createObjectURL(conversionResult);
            downloadBtn.href = url;

            setTimeout(() => {
                doneIcon.style.display = 'none';
                downloadBtn.style.display = 'inline-block';
            }, 500);
        })
        .catch((e) => {
            loader.style.display = 'none';
            itemDiv.innerHTML += `<span style="color:red; margin-left:10px;">Error</span>`;
            console.error(e);
        });
    };

    window.downloadAllZip = () => {
        const zip = new JSZip();
        convertedFilesCache.forEach(file => {
            zip.file(file.name, file.blob);
        });
        zip.generateAsync({type:"blob"})
        .then(function(content) {
            saveAs(content, "heic_converted_photos.zip");
        });
    };

    window.clearAll = () => {
        if(confirm("Are you sure you want to clear your download history?")) {
            fileList.innerHTML = '';
            convertedFilesCache = [];
            updateUIState();
        }
    };

    updateUIState();

    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.backgroundColor = "#eef7fc"; dropZone.style.borderColor = "#2980b9"; });
    dropZone.addEventListener('dragleave', () => { dropZone.style.backgroundColor = "#fcfcfc"; dropZone.style.borderColor = "#3498db"; });
    dropZone.addEventListener('drop', (e) => { e.preventDefault(); dropZone.style.backgroundColor = "#fcfcfc"; dropZone.style.borderColor = "#3498db"; handleFiles(e.dataTransfer.files); });

    
}


window.addEventListener('load', () => {
    if (!localStorage.getItem('cookieConsent')) {
        setTimeout(() => {
            document.getElementById('cookieBanner').classList.add('show');
        }, 2000);
    }
});

function acceptCookies(accepted) {
    const banner = document.getElementById('cookieBanner');
    
    banner.classList.remove('show');
    
    localStorage.setItem('cookieConsent', accepted ? 'true' : 'false');
}