let dropzone = document.querySelector('#dropZone')      

    var onlyFiles = [];
    var typeEntry;
    var dropEvent = function (e) {

        e.stopPropagation();
        e.preventDefault();            
        dropzone.classList.remove('hover');   
        
        // funciona excelente
        gerArrayTreeObjectFiles(e)
        
        // mejorar
        // getTreeArrayFiles(e)
          
        return false;
    
    };
     // LA MEJOR OPCION 
    const gerArrayTreeObjectFiles = (e) => {
        var length = e.dataTransfer.items.length;
            
            for (var i = 0; i < length; i++) {
                // traverseFileTree(e.dataTransfer.items[i].webkitGetAsEntry());
                walkEntriesAsync(e.dataTransfer.items[i].webkitGetAsEntry()).then( res => {
                    console.log(res)
                    console.log(onlyFiles)
                    onlyFiles = []
                   
                })                
        }

        setTimeout(() => {
            // console.log(onlyFiles)
        }, 300);
    }

    // POR MEJORAR EL ALGORITMO PER MUY INTERESANTE
    const getTreeArrayFiles = (e) => {
        const data = e.dataTransfer.items;
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            let entry = item.webkitGetAsEntry();
            traverseDirectory(entry).then(result => console.log(result));          
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


      /*========================================================================*/
    //                  OPCION INTERESANTE A TOMAR EN CUENTA
    /*========================================================================*/

    const traverseDirectory = (entry) => {
        let reader = entry.createReader();
        // Resolved when the entire directory is traversed
        return new Promise((resolve, reject) => {
          const iterationAttempts = [];
          function readEntries() {
            // According to the FileSystem API spec, readEntries() must be called until
            // it calls the callback with an empty array.  Seriously??
            reader.readEntries((entries) => {
              if (!entries.length) {
                // Done iterating this particular directory
                resolve(Promise.all(iterationAttempts));
              } else {
                // Add a list of promises for each directory entry.  If the entry is itself
                // a directory, then that promise won't resolve until it is fully traversed.
                iterationAttempts.push(Promise.all(entries.map((ientry) => {
                  if (ientry.isFile) {
                    // DO SOMETHING WITH FILES
                    return ientry;
                  }
                  // DO SOMETHING WITH DIRECTORIES
                  return traverseDirectory(ientry);
                })));
                // Try calling readEntries() again for the same dir, according to spec
                readEntries();
              }
            }, error => reject(error));
          }
          readEntries();
        });
      }


    /*========================================================================*/
    //                              LA MEJOR OPCION
    /*========================================================================*/

    function walkEntriesAsync(node) {
        // https://wicg.github.io/entries-api/#api-entry
        if (node.isDirectory) {
            // process directories async
            return new Promise((resolve, reject) => {
                readEntriesAsync(node).then((entries) => {                    
                    let dirPromises = entries.map((dir) => walkEntriesAsync(dir));
    
                    return Promise.all(dirPromises).then((fileSets) => {
                        resolve(fileSets);
                    });
                });
            });
        } else {
            // directly resolve files
            console.log(node)
            return Promise.resolve(node);
        }
    }
    
    // convert callback interface of entry.createReader() to promise
    function readEntriesAsync(rootEntry) {
        // https://wicg.github.io/entries-api/#dir-reader
        var reader = rootEntry.createReader(),
            entriesArr = [];
    
        return new Promise((resolve, reject) => {
            reader.readEntries((entries) => {
                entries.forEach((entry) => {                    
                    entriesArr.push(entry);
                    if (entry.isFile) {
                        entry.file( file => {
                            onlyFiles.push({ file: file, path: entry.fullPath });
                        })
                    }else {
                        onlyFiles.push(entry)                      

                    }

                });
                // console.log(entriesArr,'lll')
                resolve(entriesArr);
            }, reject);
        });
    }



    var traverseFileTree = function self(item, path) {
        path = path || "";
        if (item.isFile) {
            item.file(function (file) {
                onlyFiles.push({ file: file, path: path });
            });
        } else if (item.isDirectory) {
            var dirReader = item.createReader();
            dirReader.readEntries(function (entries) {
                for (var i = 0; i < entries.length; i++) {
                    self(entries[i], path + item.name + "/");
                }
            });
        }
    };