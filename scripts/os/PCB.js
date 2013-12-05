/* 
 *   PCB.js
 *
 *	 Requires globals.js
 *
 *	 The process control block police station. Sets processes into it's designated
 *	 location (with base and limit) and makes sure they aren't doing anything bad.
 */
 
 function PCB()
 {
	this.TheAcc = 0;
	this.ThePC = 0;
	this.TheX = 0;
	this.TheY = 0;
	this.TheZ = 0;
	//
	this.PID = 0;
	this.base = 0;
	this.limit = 0;
	this.isDone = false;
	//
	this.priority = 0;
	this.isOnDisk = false;
	
	this.init = function(procID, p)
	{
		this.TheAcc = 0;
		this.ThePC = 0;
		this.TheX = 0;
		this.TheY = 0;
		this.TheZ = 0;
		//
		this.PID = procID;
		this.isDone = false;
		//
		this.priority = p;
		this.isOnDisk = false;
		
		
		// this.base and this.limit will be determined by the ID of the process
		// if the process ID "=" 0, put the process in block 1. 
		if(procID === 0) // === rather than == for accuracy
		{
			this.base = _First;
			this.limit = _First + _Size;
		}
		else if(procID === 1)
		{
			this.base = _Second;
			this.limit = _Second + _Size;
		}
		// the last ID will be 2 because that will fill up our memory
		// if another process wants to run, disk swapping will happen later. Yay
		else  if(procID === 2)
		{
			this.base = _Third;
			this.limit = _Third + _Size;
		}
		else
		{
			this.base = 0;
			this.limit = 0;
			this.isOnDisk = true;
		}
	};
	
	// Gotta check if a process is trying to hop the boarder. I hope this isn't racist.
	this.violationCheck = function(address)
	{
		if((address + this.base) > this.limit) // If the process committed a crime
		{
			this.isDone = true;
			//_OsShell.shellKill(this.PID); // arrest the process and THEORETICALLY kill it.
			_StdIn.putText("Sir, do not pass your allocated block, do not collect $200.00"); // read the process its rights
			// In reality, it should be the other way around, but this is a very aggressive OS.
		}
		else // happy process :>
		{
			return (address + this.base);
		}
	};
	
	this.toString = function()
	{
		var output = "";
		output = " PID: " + this.PID + " ThePC " + this.ThePC + " TheAcc" + this.TheAcc + " Base: " + this.base + " Limit: " + this.limit + " X: " + this.TheX + " Y: " + this.TheY + " TheZ: " + this.TheZ + " Priority: " +  this.priority + " Is On Disk: " + this.isOnDisk;
		return output;
	}
 }