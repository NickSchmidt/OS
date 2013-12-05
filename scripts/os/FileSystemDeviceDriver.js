/* ----------------------------------
	FileSystemDeviceDriver.js
   
	Requires deviceDriver.js
   
	The File System Device Driver.
   ---------------------------------- */
   
FileSystemDeviceDriver.prototype = new DeviceDriver; 
   
function FileSystemDeviceDriver()                     
{
    this.driverEntry = krnFileDriverEntry;
    this.isr = krnFileOperations;
}

function krnFileDriverEntry()
{
	if(typeof(Storage)!=="undefined")
	{
		this.status = "loaded";
	}
		else
	{
		this.status = "Sorry could not Start Hard Drive, Storage not enabled.";
	}
}

function krnFileOperations(params)
{
	var op = params;
	switch(op)
	{
		case 0:
			format();
			break;
		case 1: 
			create(params);
			break;
		case 2:
			write(params);
			break;
		case 3:
			read(params);
			break;
		case 4:
			deleteFile(params);
			break;
		case 5:
			listFiles();
			break;
		default:
			krnTrapError("Operation invalid.");
			break;		
	}
}

// formats disk
function format()
{
	for(i = 0; i < _NumTracks; i++)
	{
		for(j = 0; j < _NumSectors; j++)
		{
			for(k = 0; k < _NumBlocks; k++)
			{
				var TSB = i.toString() + j.toString() + k.toString();
				localStorage[TSB] = "0NAS-------------------------------------------------------------~";
			}
		}
	}
	document.getElementById("btnShowMe").disabled = false;
	localStorage[_MBR] = "MBR~";
}

// creates file
function create(params)
{
	emptyDir = findMetaData();
	if(!emptyDir)
	{
		_StdIn.putText("File full");
		_StdIn.advanceLine();
		_StdIn.putText(_OsShell.promptStr);
	}
	else
	{
		if(!findAvailableData())
		{
			_StdIn.putText("No available data.");
		}
		localStorage[emptyDir] = "1" + findAvailableData() + _FileName + "~";
		localStorage[findAvailableData()] = "1NAS" + localStorage[findAvailableData()].substring(4);
	}
}

// writes to a file
function write(params)
{
	var fileName = findFileName(_FileName);
	var i = 0;
	if(fileName)
	{
		if(localStorage[fileName].substring(1,4) !== "NAS")
		{
			deleteFile(_FileName);
			create(_FileName);
		}
		fileName = findFileName(_FileName);
		var numBlocks = Math.floor(_ToBeWritten.length/_WritableChar) + 1;
		while(numBlocks > 0)
		{
			needsToBeWritten = _ToBeWritten.substring(i*_WritableChar,(i*_WritableChar + _WritableChar));
			localStorage[fileName] = "1NAS";
			if(numBlocks === 1)
			{
				localStorage[fileName] = "1NAS" + needsToBeWritten + "~";
				numBlocks--;
				if(!_ToBePrinted)
				{
					_ToBePrinted = true;
					_CPU.isDoneWriting();
				}
			}
			else
			{
				if(findAvailableData())
				{
					localStorage[fileName] = "1" + findAvailableData() + needsToBeWritten;
					fileName = findAvailableData();
					numBlocks--;
				}
				else
				{
					numBlocks = 0;
				}
			}
			i++;
		}

	}
	else
	{
				_StdIn.putText("File not found");
				_StdIn.advanceLine();
				_StdIn.putText(_OsShell.promptStr);
				_ToBeWritten = "";
	}
}

// reads file
function read(params)
{
	var fileName = findFileName(_FileName);
	var i = 0;
	var end = false;
	_ToBeRead = "";
	if(fileName)
	{
		while(!end)
		if(localStorage[fileName].indexOf("~") !== -1)
		{
			_ToBeRead += localStorage[fileName].substring(4, localStorage[fileName].indexOf("~"));
			if(_ToBePrinted)
			{
				for(i = 0; i < _ToBeRead.length; i++)
				{
					_StdIn.putText(_ToBeRead[i]);
				}
				_StdIn.advanceLine();
				_StdIn.putText(_OsShell.promptStr);
			}
			else
			{
				_CPU.toRead();
			}
			end = true;
		}
		else
		{
			_ToBeRead += localStorage[fileName].substring(4);
			fileName = localStorage[fileName].substring(1,4);
		}
	}
	else
	{
				_StdIn.putText("File not found");
				_StdIn.advanceLine();
				_StdIn.putText(_OsShell.promptStr);
	}	
}

// deletes file
function deleteFile(params)
{
	var fileName = findFileName(_FileName);
	var i = 0;
	var end = false;
	if(fileName)
	{
		while(!end)
		if(localStorage[fileName].indexOf("~") !== -1)
		{
			localStorage[fileName] = "0NAS" + localStorage[fileName].substring(4);
			localStorage[findFile(_FileName)] = "0NAS" + localStorage[findFile(_FileName)].substring(4);
			end = true;
		}
		else
		{
			fileName2 = fileName;
			fileName = localStorage[fileName].substring(1,4);
			localStorage[fileName2] = "0NAS" + localStorage[fileName].substring(4);
		}
	}
	else
	{
				_StdIn.putText("File not found");
				_StdIn.advanceLine();
				_StdIn.putText(_OsShell.promptStr);
	}	
}

// searches for available data. Kinda important 
function findAvailableData()
{
	for(i = 1; i < _NumTracks; i++)
	{
		for(j = 0; j < _NumSectors; j++)
		{
			for(k = 0; k < _NumBlocks; k++)
			{
				var TSB = i.toString() + j.toString() + k.toString();
				if(localStorage[TSB][0] === "0")
				{
					return TSB;
				}
			}
		}
	}
	return false;
}

function findMetaData()
{
	i = 0;
	for(j = 0; j < _NumSectors; j++)
	{
		for(k = 0; k < _NumBlocks; k++)
		{
			var TSB = i.toString() + j.toString() + k.toString();
			if(localStorage[TSB][0] === "0")
			{
				return TSB;
			}
		}
	}
	return false;
}

// searches for file name
function findFileName(_FileName)
{
	i = 0;
	for(j = 0; j < _NumSectors; j++)
	{
		for(k = 0; k < _NumBlocks; k++)
		{
			var TSB = i.toString() + j.toString() + k.toString();
			if(localStorage[TSB][0] === "1")
			{
				var tempFileName = localStorage[TSB].substring(4, localStorage[TSB].indexOf("~"));
				if(tempFileName === _FileName)
				{
					return localStorage[TSB].substring(1,4);
				}
			}
		}
	}
	return false;
}

// searches for the file
function findFile(_FileName)
{
	i = 0;
	for(j = 0; j < _NumSectors; j++)
	{
		for(k = 0; k < _NumBlocks; k++)
		{
			var TSB = i.toString() + j.toString() + k.toString();
			if(localStorage[TSB][0] === "1")
			{
				var tempFileName = localStorage[TSB].substring(4, localStorage[TSB].indexOf("~"));
				if(tempFileName === _FileName)
				{
					return TSB;
				}
			}
		}
	}
	return false;
}

// A list of all the files
function listFiles()
{
	i = 0;
	var toBeReturned = "";
	for(j = 0; j < _NumSectors; j++)
	{
		for(k = 0; k < _NumBlocks; k++)
		{
			var TSB = i.toString() + j.toString() + k.toString();
			if(localStorage[TSB][0] === "1")
			{
					_StdIn.putText(localStorage[TSB].substring(4));
					_StdIn.advanceLine();
			}
		}
	}
	_StdIn.advanceLine();
	_StdIn.putPrompt();
}