/* ----------

	memory.js
	
	Holds the memory for the programs.
	The current size of the memory is 768.
	
------------- */
/*
function Memory()
{
	this.memory = [""]; // hold the memory as an array
	//this.size = _MemorySize; // _MemorySize = 768 (But not a magic number :> )
	var i = 0;

	this.init = function()
	{
		for(i = 0; i < _MemorySize; i++)
		{
			//this.memoryArray[i] = "00"; // temporary storage for memory initializing all cells to 00.
			this.memory[i] = "00"; //new memoryLocation();
			document.getElementById(i).innerHTML = this.memory[i]; 
		}
	};*/
	
function memory(){
        this.memory = [""];
        var i = 0;
        this.init = function() {
                while( i < _MemorySize)
                {
                        this.memory[i] = "00";
                        document.getElementById(i).innerHTML = this.memory[i];
                        i++;
						_NumPrograms = 0;
                }
        };
	this.decimal = function(address)
	{
		var address = parseInt(address, 16);
		return address;
	}
}