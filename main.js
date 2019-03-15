let dropzone = document.querySelector('#dropZone')      

    let onlyFiles = new Array()
    let arrayFiles = []
    var typeEntry;
    var dropEvent = async function (e) {

        e.stopPropagation();
        e.preventDefault();            
        dropzone.classList.remove('hover');   
        
        // funciona excelente
        // gerArrayTreeObjectFiles(e)
        
        // mejorar
        let res1 = await getTreeArrayFiles(e)
          console.log(res1)
        return false;
    
    };
     // LA MEJOR OPCION 
    const gerArrayTreeObjectFiles = (e) => {
        var length = e.dataTransfer.items.length;
            
            for (var i = 0; i < length; i++) {
                // traverseFileTree(e.dataTransfer.items[i].webkitGetAsEntry());
                walkEntriesAsync(e.dataTransfer.items[i].webkitGetAsEntry()).then( res => {
                    console.log(onlyFiles)

                    
                    // console.log(res)
                   
                    onlyFiles = new Array()
                   
                }).catch(err => console.log(err))                
        }

        // setTimeout(() => {
        //     console.log(onlyFiles)
        // }, 300);
    }

    // POR MEJORAR EL ALGORITMO PER MUY INTERESANTE
    const getTreeArrayFiles =  (e) => {
        return new Promise( (r,rj) => {
            const data = e.dataTransfer.items;
            // for (let i = 0; i < data.length; i++) {
            //     const item = data[i];
            //     let entry = item.webkitGetAsEntry();
            //     // traverseDirectory(entry).then(result => console.log(result));  
            //     let res = await traverseDirectory(entry)         
            //     console.log(res)
            // }
            
            // console.log(Array.from(data))
            Array.from(data).forEach(async (item, index) => {
                // const item = data[i];
                // console.log(item)
                let entry = item.webkitGetAsEntry();
                // // traverseDirectory(entry).then(result => console.log(result));  
                let res = await traverseDirectory(entry)         
                console.log(res)
                if (index == Array.from(data).length) {
                    r('termino Pendejo!!')
                }

            });

        })

        // await asyncForEach(Array.from(data), async (item) => {
        //     // await waitFor(50);
        //     var entry = item.webkitGetAsEntry();
        //     let res = await traverseDirectory(entry)
        //     console.log(res)


        //     // console.log(num);
        // })





        // [1,2].forEach( e => console.log(e))
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
        return new Promise((resolve, reject) => {
            if (node.isDirectory) {
                // process directories async
                readEntriesAsync(node).then((entries) => {  
                    let dirPromises = entries.map((dir) => walkEntriesAsync(dir));
                    
                    return Promise.all(dirPromises).then((fileSets) => {                        
                        onlyFiles.push(node)  
                        // node.file(file => {
                        //     onlyFiles.push({ file: file, path: node.fullPath })                            
                        // })                
                        resolve(fileSets);
                    });
                });

            } else { 
                // console.log(node)  
                node.file( file => {
                    onlyFiles.push({ file: file, path: node.fullPath })            
                    resolve(node);
                })
            }
        });
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