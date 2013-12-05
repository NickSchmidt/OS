/* ------------  
   CPU.js

   Requires global.js.
   
   Routines for the host CPU simulation, NOT for the OS itself.  
   In this manner, it's A LITTLE BIT like a hypervisor,
   in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
   that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
   JavaScript in both the host and client environments.

   This code references page numbers in the text book: 
   Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
   ------------ */

function Cpu() {
    this.PC    = 0;     // Program Counter
    this.Acc   = 0;     // Accumulator
    this.Xreg  = 0;     // X register
    this.Yreg  = 0;     // Y register
    this.Zflag = 0;     // Z-ero flag (Think of it as "isZero".)
    this.isExecuting = false; // boolean to determine if a process is executing or not
	this.Quantum = _Quantum;
	this.ValidTick = 0;	// Keeps track of the ticks since the last VALID opCode instruction.
    this.isPriority = false;
	
	// init's the CPU and displays everything onto the canvas
    this.init = function() {
        this.PC    = 0;
		document.getElementById('PC').innerHTML = this.PC;
        this.Acc   = 0;
		document.getElementById('Acc').innerHTML = this.Acc;
        this.Xreg  = 0;
		document.getElementById('xReg').innerHTML = this.Xreg;
        this.Yreg  = 0;
		document.getElementById('yReg').innerHTML = this.Yreg;
        this.Zflag = 0;      
		document.getElementById('zFlag').innerHTML = this.Zflag;
        this.isExecuting = false;
		_PCB = new PCB;
		_PCB.init(0);
    };
    
    this.cycle = function() {
        krnTrace("CPU cycle");
        // TODO: Accumulate CPU usage and profiling statistics here.
        // Do the real work here. Be sure to set this.isExecuting appropriately.
		if(this.isExecuting)
		{
			this.CPUScheduler();
			var opCode = _Memory.memory[this.PC + _PCB.base];
			switch(opCode)
			{
				// load acc with constant
				case "A9":
				{
						// essentially the same for all opCode. 
						// convert the information in memory and put it where it needs to go
						// in this case, this.Acc. Then display it.
					this.Acc = parseInt(_Memory.memory[++this.PC + _PCB.base], 16); 
					document.getElementById('Acc').innerHTML = this.Acc;
					_PCB.ThePC = this.PC;
					_PCB.TheAcc = this.Acc;
					this.ValidTick = 0;
					break;
				}
				
				// load acc from memory
				case "AD":
				{
					var address = _Memory.memory[++this.PC + _PCB.base];
					this.Acc = _Memory.memory[_PCB.violationCheck(_Memory.decimal(address))];
					document.getElementById('Acc').innerHTML = this.Acc;
					_PCB.ThePC = this.PC;
					_PCB.TheAcc = this.Acc;
					this.ValidTick = 0;
					break;
				}
				
				// store the acc in memory
				case "8D":
				{
					var address = _Memory.memory[++this.PC + _PCB.base];
					_Memory.memory[_PCB.violationCheck(_Memory.decimal(address))] = this.Acc.toString(16);
					document.getElementById(_PCB.violationCheck(_Memory.decimal(address))).innerHTML = this.Acc.toString(16).toUpperCase();
					_PCB.ThePC = this.PC;
					this.ValidTick = 0;
					break;
				}
				
				// add contents of address to contents of acc and stores in acc
				case "6D":
				{
					var addering = _Memory.memory[++this.PC + _PCB.base];
					this.Acc = this.Acc + parseInt(_Memory.memory[_PCB.violationCheck(_Memory.decimal(addering))], 16);
					document.getElementById('Acc').innerHTML = this.Acc;
					_PCB.ThePC = this.PC;
					_PCB.TheAcc = this.Acc;
					this.ValidTick = 0;
					break;
				}
				
				case "A2":
				{
					this.Xreg = parseInt(_Memory.memory[++this.PC + _PCB.base], 16);
					document.getElementById("xReg").innerHTML = this.Xreg.toString(16);
					_PCB.ThePC = this.PC;
					_PCB.TheX = this.Xreg
					this.ValidTick = 0;
					break;
				}
				case "AE":
				{
					var address = _Memory.memory[++this.PC + _PCB.base];
					this.Xreg = parseInt(_Memory.memory[_PCB.violationCheck(_Memory.decimal(address))], 16);
					document.getElementById("xReg").innerHTML = this.Xreg.toString(16);
					_PCB.ThePC = this.PC;
					_PCB.TheY = this.Xreg;
					this.ValidTick = 0;
					break;
				}
				
				case "A0":
				{
					this.Yreg = parseInt(_Memory.memory[++this.PC + _PCB.base], 16);
					document.getElementById('yReg').innerHTML = this.Yreg.toString(16);
					_PCB.ThePC = this.PC;
					_PCB.TheY = this.Yreg;
					this.ValidTick = 0;
					break;
				}
				
				case "AC":
				{
					var address = _Memory.memory[++this.PC + _PCB.base];
					this.Yreg = parseInt(_Memory.memory[_PCB.violationCheck(_Memory.decimal(address))], 16);
					document.getElementById('yReg').innerHTML = this.Yreg.toString(16);
					_PCB.ThePC = this.PC;
					_PCB.TheY = this.Yreg;
					this.ValidTick = 0;
					break;
				}
				
				case "EA":
				{
					this.ValidTick = 0;
					break;
				}
				
				case "00":
				{
					if((_Memory.memory[(this.PC + _PCB.base) + 1] === "00") && (_Memory.memory[(this.PC + _PCB.base) + 2] === "00") && (_Memory.memory[(this.PC + _PCB.base) + 3] === "00"))
					{
						if(_ReadyQueue.isEmpty())
						{
							_PCB.isDone = true;
							_Memory.init();
							this.isExecuting = false;
						}
						else
						{
							_PCB.isDone = true;
							_KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, 0));
						}
					}
					this.ValidTick = 0;
					break;
				}
				
				case "EC":
				{
					var address = _Memory.memory[++this.PC + _PCB.base];
					if(this.Xreg != _Memory.memory[_PCB.violationCheck(_Memory.decimal(address))])
					{
						this.Zflag = 1;
						_PCB.TheZ = 1;
						document.getElementById('zFlag').innerHTML = this.Zflag;
					}
					else
					{
						this.Zflag = 0;
						_PCB.TheZ = 0;
						document.getElementById('zFlag').innerHTML = this.Zflag;
					}
					_PCB.ThePC = this.PC;
					this.ValidTick = 0;
					break;
				}
				
				case "D0":
				{	
					if(this.Zflag > 0)
					{
						var offset = _Memory.memory[++this.PC + _PCB.base];
						offset = parseInt(offset, 16);
						this.PC = ((this.PC + _PCB.base + offset) % (_Size + 1));
						_PCB.ThePC = this.PC;
					}
					else
					{
						this.PC++;
						_PCB.ThePC = this.PC;
					}
					this.ValidTick = 0;
					break;
				}
				
				case "EE":
				{
					var index = _PCB.violationCheck(_Memory.decimal(_Memory.memory[++this.PC + _PCB.base]));
					adder = parseInt(_Memory.memory[index], 16);
					adder++;
					_Memory.memory[index] = adder.toString(16);
					document.getElementById(index).innerHTML = adder.toString(16);
					_PCB.ThePC = this.PC;
					this.ValidTick = 0;
					break;
				}
				
				case "FF":
				{
					if(this.Xreg === 1) // === for accuracy
					{
						_Console.putText(this.Yreg.toString(16));
						_Console.putText(" ");
					}
					else if(this.Xreg === 2)
					{
						var yTemp = this.Yreg;
						_PCB.TheY = this.Yreg;
						while(_Memory.memory[yTemp] != "00")
						{
							_Console.putText(String.fromCharCode(parseInt(_Memory.memory[yTemp + _PCB.base], 16)));
							yTemp++;
						}
						_Console.putText(" ");
					}
					this.ValidTick = 0;
					break;
				}
				
				default:
				{
					if(this.ValidTick === 3)
					{
						if(!_Memory.memory[(this.PC + _PCB.base)] === "00")
						{
							_KernelInterruptQueue.enqueue(new Interrupt(INVALID_INSTRUCTION_IRQ, 0));
						}
					}
					else
					{
						this.PC++;
						_PCB.ThePC = this.PC;
						document.getElementById('PC').innerHTML = this.PC;
						this.ValidTick++;
					}
				}
			}
			this.PC++;
			_PCB.ThePC = this.PC;
			document.getElementById('PC').innerHTML = this.PC;
		}
	};
/*
	// load acc with constant
	this.ldaCons = function()
	{
			// essentially the same for all opCode. 
			// convert the information in memory and put it where it needs to go
			// in this case, this.Acc. Then display it.
		this.Acc = parseInt(_Memory.memory[++this.PC + _PCB.base], 16); 
		document.getElementById('Acc').innerHTML = this.Acc;
		_PCB.ThePC = this.PC;
		_PCB.TheAcc = this.Acc;
		this.ValidTick = 0;
	};
	
	// load acc from memory
	this.ldaMem = function()
	{
		var address = _Memory.memory[++this.PC + _PCB.base];
		this.Acc = _Memory.memory[_PCB.violationCheck(_Memory.decimal(address))];
		document.getElementById('Acc').innerHTML = this.Acc;
		_PCB.ThePC = this.PC;
		_PCB.TheAcc = this.Acc;
		this.ValidTick = 0;
	};
	
	// store the acc in memory
	this.staMem = function()
	{
		var address = _Memory.memory[++this.PC + _PCB.base];
		_Memory.memory[_PCB.violationCheck(_Memory.decimal(address))] = this.Acc.toString(16);
		document.getElementById(_PCB.violationCheck(_Memory.decimal(address))).innerHTML = this.Acc.toString(16).toUpperCase();
		_PCB.ThePC = this.PC;
		this.ValidTick = 0;
	};
	
	// add contents of address to contents of acc and stores in acc
	this.ADC = function()
	{
		var addering = _Memory.memory[++this.PC + _PCB.base];
		this.Acc = this.Acc + parseInt(_Memory.memory[_PCB.violationCheck(_Memory.decimal(addering))], 16);
		document.getElementById('Acc').innerHTML = this.Acc;
		_PCB.ThePC = this.PC;
		_PCB.TheAcc = this.Acc;
		this.ValidTick = 0;
	};
	
	this.ldxCons = function()
	{
		this.Xreg = parseInt(_Memory.memory[++this.PC + _PCB.base], 16);
		document.getElementById("xReg").innerHTML = this.Xreg.toString(16);
		_PCB.ThePC = this.PC;
		_PCB.TheX = this.Xreg
		this.ValidTick = 0;
	};
	this.ldxMem = function()
	{
		var address = _Memory.memory[++this.PC + _PCB.base];
		this.Xreg = parseInt(_Memory.memory[_PCB.violationCheck(_Memory.decimal(address))], 16);
		document.getElementById("xReg").innerHTML = this.Xreg.toString(16);
		_PCB.ThePC = this.PC;
		_PCB.TheY = this.Xreg;
		this.ValidTick = 0;
	};
	
	this.ldyCons = function()
	{
		this.Yreg = parseInt(_Memory.memory[++this.PC + _PCB.base], 16);
		document.getElementById('yReg').innerHTML = this.Yreg.toString(16);
		_PCB.ThePC = this.PC;
		_PCB.TheY = this.Yreg;
		this.ValidTick = 0;
	};
	
	this.ldyMem = function()
	{
		var address = _Memory.memory[++this.PC + _PCB.base];
		this.Yreg = parseInt(_Memory.memory[_PCB.violationCheck(_Memory.decimal(address))], 16);
		document.getElementById('yReg').innerHTML = this.Yreg.toString(16);
		_PCB.ThePC = this.PC;
		_PCB.TheY = this.Yreg;
		this.ValidTick = 0;
	};
	
	this.breakSysCall = function()
	{
		if((_Memory.memory[(this.PC + _PCB.base) + 1] === "00") && (_Memory.memory[(this.PC + _PCB.base) + 2] === "00") && (_Memory.memory[(this.PC + _PCB.base) + 3] === "00"))
		{
			if(_ReadyQueue.isEmpty())
			{
				_PCB.isDone = true;
				_Memory.init();
				this.isExecuting = false;
			}
			else
			{
				_PCB.isDone = true;
				_KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, 0));
			}
		}
		this.ValidTick = 0;
	};
	
	this.compareX = function() // check later
	{
		var address = _Memory.memory[++this.PC + _PCB.base];
		if(this.Xreg != _Memory.memory[_PCB.violationCheck(_Memory.decimal(address))])
		{
			this.Zflag = 1;
			_PCB.TheZ = 1;
			document.getElementById('zFlag').innerHTML = this.Zflag;
		}
		else
		{
			this.Zflag = 0;
			_PCB.TheZ = 0;
			document.getElementById('zFlag').innerHTML = this.Zflag;
		}
		_PCB.ThePC = this.PC;
		this.ValidTick = 0;
	};
	
	this.braX = function()
	{	
		if(this.Zflag > 0)
		{
			var offset = _Memory.memory[++this.PC + _PCB.base];
			offset = parseInt(offset, 16);
			this.PC = ((this.PC + _PCB.base + offset) % (_Size + 1));
			_PCB.ThePC = this.PC;
		}
		else
		{
			this.PC++;
			_PCB.ThePC = This.PC;
		}
		this.ValidTick = 0;
	};
	
	this.incr = function()
	{
		var index = _PCB.violationCheck(_Memory.decimal(_Memory.memory[++this.PC + _PCB.base]));
		adder = parseInt(_Memory.memory[index], 16);
		adder++;
		_Memory.memory[index] = adder.toString(16);
		document.getElementById(index).innerHTML = adder.toString(16);
		_PCB.ThePC = this.PC;
		this.ValidTick = 0;
	};
	
	this.sysCall = function()
	{
		if(this.Xreg === 1) // === for accuracy
		{
			_Console.putText(this.Yreg.toString(16));
			_Console.putText(" ");
		}
		else if(this.Xreg === 2)
		{
			var yTemp = this.Yreg;
			_PCB.TheY = this.Yreg;
			while(_Memory.memory[yTemp] != "00")
			{
				_Console.putText(String.fromCharCode(parseInt(_Memory.memory[yTemp + _PCB.base], 16)));
				yTemp++;
			}
			_Console.putText(" ");
		}
		this.ValidTick = 0;
	};
	*/
	this.CPUScheduler = function()
	{
		if(_CpuSchedule === "priority")
		{
			if(!this.isPriority)
			{
				_KernelInterruptQueue.enqueue(new Interrupt(PRIORITY_IRQ, 0));
			}
		}
		else if(this.Quantum >= _Quantum)
		{
			_KernelInterruptQueue.enqueue(new Interrupt(CONTEXT_SWITCH_IRQ, 0));
		}
		this.Quantum++;
	};
	
	this.Scheduler = function(program)
	{
		_ReadyQueue.enqueue(program);
		if(!this.isExecuting)
		{
			_PCB = _ReadyQueue.dequeue();
		}
	};
	
	this.ContextSwitch = function()
	{
		var temp = _PCB;
		_PCB.ThePC = this.PC;
		_PCB.TheAcc = this.Acc;
		_PCB.TheX = this.Xreg;
		_PCB.TheY = this.Yreg;
		_PCB.TheZ = this.Zflag;
		
		if(!_PCB.isDone)
		{
			_ReadyQueue.enqueue(temp);
		}
		
		if(_ReadyQueue.isEmpty())
		{
			this.isExecuting = false;
			_Memory.init();
		}
		
		_PCB = _ReadyQueue.dequeue();
		if(_PCB.isOnDisk)
		{
			this.isExecuting = false;
			_KernelInterruptQueue.enqueue( new Interrupt(SWAP_IRQ, temp) );
			
		}
		
		if(_ReadyQueue.getSize() === 3)
		{
			document.getElementById('RQ4').innerHTML = temp.toString();
			var tempPCB3 = document.getElementById('RQ4').textContent;
			var tempPCB2 = document.getElementById('RQ3').textContent;
			var tempPCB1 = document.getElementById('RQ2').textContent;
			document.getElementById('RQ1').innerHTML = tempPCB1;
			document.getElementById('RQ2').innerHTML = tempPCB2;
			document.getElementById('RQ3').innerHTML = tempPCB3;	
			document.getElementById('RQ4').innerHTML = "null";	
		}
			
		if(_ReadyQueue.getSize() === 2)
		{
			document.getElementById('RQ3').innerHTML = temp.toString();
			var tempPCB2 = document.getElementById('RQ3').textContent;
			var tempPCB1 = document.getElementById('RQ2').textContent;
			document.getElementById('RQ2').innerHTML = tempPCB2;
			document.getElementById('RQ1').innerHTML = tempPCB1;
			document.getElementById('RQ3').innerHTML = "null";
			document.getElementById('RQ4').innerHTML = "null";
		}
		else if (_ReadyQueue.getSize() === 1)
		{
			document.getElementById('RQ2').innerHTML = temp.toString();
			var tempPCB1 = document.getElementById('RQ2').textContent;
			document.getElementById('RQ1').innerHTML = tempPCB1;
			document.getElementById('RQ2').innerHTML = "null";
			document.getElementById('RQ3').innerHTML = "null";
			document.getElementById('RQ4').innerHTML = "null";
		}
		else if(_ReadyQueue.getSize() === 0)
		{
			document.getElementById('RQ1').innerHTML = "null";
			document.getElementById('RQ2').innerHTML = "null";
			document.getElementById('RQ3').innerHTML = "null";
			document.getElementById('RQ4').innerHTML = "null";
		}
		this.PC = _PCB.ThePC;
		this.Acc = _PCB.TheAcc;
		this.Xreg = _PCB.TheX;
		this.Yreg = _PCB.TheY;
		this.Zflag = _PCB.TheZ;
		document.getElementById('PC').innerHTML = this.PC + _PCB.base;
		document.getElementById('Acc').innerHTML = this.Acc;
		document.getElementById('xReg').innerHTML = this.Xreg.toString(16);
		document.getElementById('yReg').innerHTML = this.Yreg.toString(16);
		document.getElementById('zFlag').innerHTML = this.Zflag;
		this.Quantum = 0;
	};
	
	this.InvalidInstruction = function()
	{
		_PCB.isDone = true;
		_StdIn.putText("Invalid instruction at: " + (this.PC + _PCB.base));
	};
	
	this.FixPriority = function()
	{
	//Really Priority is similar to First come First serve with a particular order, as a result, I simply recreate the ready queue
	//Based on the priority values in the PCB
		var maxPriorityNum = _PCB1.priority;
		var maxPriority = _PCB1;
		var nextPriorityNum = _PCB2.priority;
		var nextPriority = _PCB2;
		var thirdNum = _PCB3.priority;
		var thirdPriority = _PCB3;
		//Insert Last Here
		if(maxPriorityNum < _PCB2.priority)
		{
			if(nextPriorityNum < maxPriorityNum)
			{
				if(thirdNum < nextPriorityNum)
				{
					thirdNum = nextPriorityNum;
					thirdPriority = nextPriority;
				}
				nextPriorityNum = maxPriorityNum;
				nextPriority = maxPriority;
			}
			maxPriorityNum = _PCB2.priority;
			maxPriority = _PCB2;
		}
		else if(maxPriorityNum < _PCB3.prioritiy)
		{
			if(nextPriorityNum < maxPriorityNum)
			{
				if(thirdNum < nextPriorityNum)
				{
					thirdNum = nextPriorityNum;
					thirdPriority = nextPriority;
				}
				nextPriorityNum = maxPriorityNum;
				nextPriority = maxPriority;
			}
			maxPriorityNum = _PCB3.priority;
			maxPriority = _PCB3;
		}
		
		while(!_ReadyQueue.isEmpty)
		{
			_ReadyQueue.dequeue();
		}
		_ReadyQueue.enqueue(maxPriority);
		_ReadyQueue.enqueue(nextPriority);
		_ReadyQueue.enqueue(thirdPriority);
		
	};
	
	this.Swap = function(temp)
	{
			_FileName = "~SwapFile";
			_ToBePrinted = false;
			var j = temp.base;
			_ToBeWritten = "";
			_StartingPoint = temp.base;
			while (j <= temp.limit)
			{
				_ToBeWritten += _Memory.memory[j] + " ";
				j++;
			}
			_KernelInterruptQueue.enqueue( new Interrupt(FILE_SYSTEM_IRQ, 3) );
			temp.isOnDisk = true;
			_PCB.base = temp.base;
			_PCB.limit = temp.limit;
			_PCB.isOnDisk = false;
	};
	
	this.toRead = function()
	{
		j = _StartingPoint;
		var toBeSwapped = "";
		toBeSwapped = _ToBeRead.split(" ");
		for(i = 0; i <= _Size; i++)
		{
			_Memory.memory[j] = toBeSwapped[i];
			document.getElementById(j).innerHTML=_Memory.memory[j];
			j++;
		}
		_KernelInterruptQueue.enqueue( new Interrupt(FILE_SYSTEM_IRQ, 2) );
	};
	
	this.isDoneWriting = function()
	{
		this.PC    = _PCB.ThePC;
		this.Acc   = _PCB.TheAcc;
		this.Xreg  = _PCB.TheX;
		this.Yreg  = _PCB.TheY;
		this.Zflag = _PCB.TheZ;
		document.getElementById('PC').innerHTML = this.PC + _PCB.base;
		document.getElementById('Acc').innerHTML = this.Acc;
		document.getElementById('xReg').innerHTML = this.Xreg.toString(16);
		document.getElementById('yReg').innerHTML = this.Yreg.toString(16);
		document.getElementById('zFlag').innerHTML = this.Zflag;	
		document.getElementById('RL1').innerHTML = _PCB1.toString();
		document.getElementById('RL2').innerHTML = _PCB2.toString();
		document.getElementById('RL3').innerHTML = _PCB3.toString();	
		document.getElementById('RL4').innerHTML = _PCB4.toString();
		this.isExecuting = true;	
	};
	
	this.InvalidOpCode = function()
	{
			_PCB.isDone = true;
			if (!_TsundereMode)
			{
				_StdIn.putText("Me thinks you typed something wrong at " + (this.PC + _PCB.base));						
			}
			else
			{
				_StdIn.putText("God, who taught you how to program? A Ko-Wa-La? because you are terrible at it " + (this.PC + _PCB.base));
			}
	};
}
