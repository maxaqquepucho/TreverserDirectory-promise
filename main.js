let dropzone = document.querySelector('#dropZone')      

    let onlyFiles = new Array()
    let arrayFiles = []
    var typeEntry;
    var dropEvent = async function (e) {

        e.stopPropagation();
        e.preventDefault();            
        dropzone.classList.remove('hover');   
        
        // funciona excelente
        gerArrayTreeObjectFiles(e)
        
       
        return false;
    
    };
     // LA MEJOR OPCION 
    const gerArrayTreeObjectFiles = async (e) => {
        var length = e.dataTransfer.items.length;
        let fileArr = []
        for (let i = 0; i < length; i++) {
            fileArr.push(e.dataTransfer.items[i].webkitGetAsEntry());
            
        }
         
        let arrayObjectFiles = []
        for (var i = 0; i < length; i++) {
            
            let res =  await walkEntriesAsync(fileArr[i])  
            console.log(res)
            
            arrayObjectFiles.push({
                name         : getBranchName(res),
                isDirectory  : fileArr[i].isDirectory,
                cantFiles    : res.length,
                cantUpload   : 0,
                arrayFiles   : res
            })

        }
        console.log(arrayObjectFiles)
        console.log('termino?')
       
    }

    function walkEntriesAsync(node) {
        // https://wicg.github.io/entries-api/#api-entry
        let newNode = node
        let onlyFiles = [] // acumulador
        return new Promise( (resolve, reject) => {
            const recursiveWalkEntries = (node) => {
                return new Promise((resolve, reject) => {                   
                    if (node.isDirectory) {
                        // process directories async
                        readEntriesAsync(node).then((entries) => {  
                            let dirPromises = entries.map((dir) => recursiveWalkEntries(dir));
                            
                            return Promise.all(dirPromises).then((fileSets) => {                        
                                onlyFiles.push(node)                                                
                                resolve(fileSets);
                            });
                        });
        
                    } else { 
                        // console.log(node)  
                        node.file( file => {
                            onlyFiles.push(
                                {   file: file, 
                                    fullPath: node.fullPath, 
                                    isDirectory: node.isDirectory,
                                    isFile: node.isFile  
                                });            
                            resolve(node);
                        })
                    }
                });
    
            }
    
            
            recursiveWalkEntries(newNode).then(res => {
              resolve(onlyFiles)  
            })

        });
    }

    function getBranchName(array) {
        return array[0].fullPath.split('/')[1]
    }
    
    // convert callback interface of entry.createReader() to promise
    function readEntriesAsync(rootEntry) {
        // https://wicg.github.io/entries-api/#dir-reader
        var reader = rootEntry.createReader(),
            entriesArr = [];
    
        return new Promise((resolve, reject) => {
            reader.readEntries((entries) => {
                for (let i = 0; i < entries.length; i++) {
                    const entry = entries[i];
                    entriesArr.push(entry);                    
                }
                resolve(entriesArr);                
                
            }, reject);
        });
    }

    async function asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    var dragEnter = function (e) {
        dropzone.classList.add('active');
        e.stopPropagation();
        e.preventDefault();
    };

    var dragOver = function (e) {
        e.stopPropagation();
        e.preventDefault();
    };
    
    var dragLeave = function (e) {
        dropzone.classList.remove('active');
        e.stopPropagation();
        e.preventDefault();
    };
    
    dropzone.addEventListener('dragenter', dragEnter, false);
    dropzone.addEventListener('dragover', dragOver, false);
    dropzone.addEventListener('dragleave', dragLeave, false);
    dropzone.addEventListener('drop', dropEvent, false);
