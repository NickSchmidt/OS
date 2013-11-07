/* ----------

	memory.js
	
	Holds the memory for the programs.
	The current size of the memory is 768.
	
------------- */

function Memory()
{
	this.memory = []; // hold the memory as an array
	//this.size = _MemorySize; // _MemorySize = 768 (But not a magic number :> )

	this.init = function()
	{
		for(i = 0; i < _MemorySize;; i++)
		{
			//this.memoryArray[i] = "00"; // temporary storage for memory initializing all cells to 00.
			this.memory[i] = "00"; //new memoryLocation();
			document.getElementById(i).innerHTML = this.memory[i]; 
		}
	};
	
	this.decimal = function(address)
	{
		var address = parseInt(address, 16);
		return address;
	}
}