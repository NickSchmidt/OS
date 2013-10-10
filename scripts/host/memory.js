/* ----------

	Memory.js
	
	Holds the memory for the programs.
	The current size of the memory is 256.
	
------------- */

function Memory()
{
	this.memoryArray = new Array(); // hold the memory as an array
	
	this.init = function()
	{
		for(i = 0; i < 256; i++)
		{
			this.memoryArray[i] = "00";
			document.getElementById(i).innerHTML = this.memoryArray[i]; 
		}
	
		return memoryArray;
	}
}