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
        
        // mejorar
        // let res1 = await getTreeArrayFiles(e)
        //   console.log(res1)
        return false;
    
    };
     // LA MEJOR OPCION 
    const gerArrayTreeObjectFiles = async (e) => {
        var length = e.dataTransfer.items.length;
        let fileArr = []
        for (let i = 0; i < length; i++) {
            fileArr.push(e.dataTransfer.items[i].webkitGetAsEntry());
            
        }
            
            for (var i = 0; i < length; i++) {
                // traverseFileTree(e.dataTransfer.items[i].webkitGetAsEntry());
                let res =  await walkEntriesAsync(fileArr[i])  
                console.log(res)             
            }
            console.log('termino?')
        // console.log(e)
        // let arrayDataTransfer = e.dataTransfer.items

        // await Array.from(arrayDataTransfer).forEachAsync(  (item, i) => {
        //     return new Promise( (resolve,reject) => {
        //         walkEntriesAsync(item.webkitGetAsEntry()).then( res => {
        //             console.log(res)
        //             resolve()
        //         })

        //     })
            
        // })
        // var length = e.dataTransfer.items.length;

        // let fileArr = []
        // for (let i = 0; i < length; i++) {
        //     fileArr.push(e.dataTransfer.items[i].webkitGetAsEntry());
            
        // }

        // console.log(fileArr)
        // myCo(function* gen() {
        //     for (var n = 0; n < length; n++) {
        //         var obj = yield promiseSqrt(fileArr[n]);
        //         console.log(obj)
        //     }
        //     console.log('termino todo?')
        // }); 
        
        
        // setTimeout(() => {
        //     console.log(onlyFiles)
        // }, 300);
    }



        function promiseSqrt(item){
            return new Promise(function (fulfill, reject){
                walkEntriesAsync(item).then( res => {
                    
                    fulfill(res)
                })
            });
        }

        function myCo(gen) {
            var i = gen();
            function sequent(result) {
                var ret = i.next(result);
                if (!ret.done) {
                    ret.value.then(sequent);
                }
            }
            sequent();
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

                function makeid(length) {
                    var text = "";
                    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                  
                    for (var i = 0; i < length; i++)
                      text += possible.charAt(Math.floor(Math.random() * possible.length));
                  
                    return text;
                  }
                  
                  console.log(makeid(5));
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
        let newNode = node
        let onlyFiles = []
        return new Promise( (r,j) => {
            const recursive = (node) => {
                return new Promise((resolve, reject) => {
                    // console.log(node, '|||||||||||')
                    if (node.isDirectory) {
                        // process directories async
                        readEntriesAsync(node).then((entries) => {  
                            let dirPromises = entries.map((dir) => recursive(dir));
                            
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
    
            
            recursive(newNode).then(res => {
              r(onlyFiles)  
            })

        })
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



         



    Array.prototype.forEachAsync = async function forEachAsync(callback, thisArg) {
        'use strict';
        var T, k;
    
        if (this == null) {
          throw new TypeError("this is null or not defined");
        }
        console.log(this , 'd')
    
        var kValue,
            // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
            O = Object(this),
           
    
            // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
            // 3. Let len be ToUint32(lenValue).
            len = O.length >>> 0; // Hack to convert O.length to a UInt32
          console.log(len, 'len')
        // 4. If IsCallable(callback) is false, throw a TypeError exception.
        // See: http://es5.github.com/#x9.11
        if ({}.toString.call(callback) !== "[object Function]") {
          throw new TypeError(callback + " is not a function");
        }
    
        // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length >= 2) {
          T = thisArg;
        }
        console.log(T, 't')
    
        // 6. Let k be 0
        k = 0;
    
        // 7. Repeat, while k < len
        while (k < len) {
    
          // a. Let Pk be ToString(k).
          //   This is implicit for LHS operands of the in operator
          // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
          //   This step can be combined with c
          // c. If kPresent is true, then
          if (k in O) {
    
            // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
            kValue = O[k];
    
            // ii. Call the Call internal method of callback with T as the this value and
            // argument list containing kValue, k, and O.
            callback.call(T, kValue, k, O);
          }
          // d. Increase k by 1.
          k++;
        }
        // 8. return undefined
        return 'termino?'
      };