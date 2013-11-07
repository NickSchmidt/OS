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
				case "A9": // load acc with constant
					this.ldaCons();
					break;
				
				case "AD": // load acc from memory
					this.ldaMem();
					break;
			
				case "8D": // store the acc in memory 
					this.staMem();
					break;
				
				case "6D": // add contents of address to contents of acc and stores in acc
					this.ADC();
					break;
				
				case "A2": // load the xReg with constant
					this.ldxCons();
					break;
				
				case "AE": // load the xReg from memory
					this.ldxMem();
					break;
				
				case "A0": // load the yReg with constant
					this.ldyCons();
					break;
				
				case "AC": // load the yReg from memory
					this.ldyMem();
					break;	
				
				case "EA": // no operation
					this.ValidTick = 0;
					break;
				
				case "00": // Break (system call)
					this.breakSysCall();
					break;
				
				case "EC": // Compare byte in memory to xReg. Sets the zFlag if equal
					this.compareX();
					break;
				
				case "D0": // Branch X bytes if zFlag = 0
					this.braX();
					break;
				
				case "EE": // increment value of a byte
					this.incr();
					break;
				
				case "FF": // system call
					this.sysCall();
					break;
				
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
						document.getElementById('PC').innerHTML = this.PC;
						this.ValidTick++;
					}
				}
			}
		}
	};
		
	// load acc with constant
	this.ldaCons = function()
	{
			// essentially the same for all opCode. 
			// convert the information in memory and put it where it needs to go
			// in this case, this.Acc. Then display it.
		this.Acc = parseInt(_Memory.memory[++this.PC + _PCB.base], 16); 
		document.getElementById('Acc').innerHTML = this.Acc;
		this.ValidTick = 0;
	};
	
	// load acc from memory
	this.ldaMem = function()
	{
		var address = _Memory.memory[++this.PC + _PCB.base];
		this.Acc = _Memory.memory[_PCB.violationCheck(_Memory.decimal(address))];
		document.getElementById('Acc').innerHTML = this.Acc;
		this.ValidTick = 0;
	};
	
	// store the acc in memory
	this.staMem = function()
	{
		var address = _Memory.memory[++this.PC + _PCB.base];
		_Memory.memory[_PCB.violationCheck(_Memory.decimal(address))] = this.Acc.toString(16);
		document.getElementById(_PCB.violationCheck(_Memory.decimal(address))).innerHTML = this.Acc.toString(16).toUpperCase();
		this.ValidTick = 0;
	};
	
	// add contents of address to contents of acc and stores in acc
	this.ADC = function()
	{
		var address = _Memory.memory[++this.PC + _PCB.base];
		this.Acc = this.Acc + parseInt(_Memory.memory[_PCB.violationCheck(_Memory.decimal(address))], 16);
		document.getElementById('Acc').innerHTML = this.Acc;
		this.ValidTick = 0;
	};
	
	this.ldxCons = function()
	{
		this.Xreg = parseInt(_Memory.memory[++this.PC + _PCB.base], 16);
		document.getElementById("xReg").innerHTML = this.Xreg.toString(16);
		this.ValidTick = 0;
	};
	this.ldxMem = function()
	{
		var address = _Memory.memory[++this.PC + _PCB.base];
		this.Xreg = parseInt(_Memory.memory[_PCB.violationCheck(_Memory.decimal(address))], 16);
		this.ValidTick = 0;
	};
	
	this.ldyCons = function()
	{
		this.Yreg = parseInt(_Memory.memory[++this.PC + _PCB.base], 16);
		document.getElementById('yReg').innerHTML = this.Yreg.toString(16);
		this.ValidTick = 0;
	};
	
	this.ldyMem = function()
	{
		var address = _Memory.memory[++this.PC + _PCB.base];
		this.Yreg = parseInt(_Memory.memory[_PCB.violationCheck(_Memory.decimal(address))], 16);
		document.getElementById('yReg').innerHTML = this.Yreg.toString(16);
		this.ValidTick = 0;
	};
	
	this.breakSysCall = function()
	{
		if((_Memory.memory[(this.PC + _PCB.base) + 1] === "00") && (_Memory.memory[(this.PC + _PCB.base) + 2] === "00") && (_Memory.memory[(this.PC + _PCB.base) + 3] === "00"))
		{
			if(_ReadyQueue.isEmpty())
			{
				_PCB.isDone = true;
				_PCB.Acc = 0;
				_PCB.Xreg = 0;
				_PCB.Yreg = 0;
				_PCB.Zflag = 0;
				this.Acc = 0;
				this.Xreg = 0;
				this.Yreg = 0;
				this.Zflag = 0;
				this.isExecuting = false;
			}
			else
			{
				_PCB.isDone = true;
				_PCB.Acc = 0;
				_PCB.Xreg = 0;
				_PCB.Yreg = 0;
				_PCB.Zflag = 0;
				this.Acc = 0;
				this.Xreg = 0;
				this.Yreg = 0;
				this.Zflag = 0;
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
			_PCB.Zflag = 1;
			document.getElementById('zFlag').innerHTML = this.Zflag;
		}
		else
		{
			this.Zflag = 0;
			_PCB.Zflag = 0;
			document.getElementById('zFlag').innerHTML = this.Zflag;
		}
		this.ValidTick = 0;
	};
	
	this.braX = function()
	{	
		if(this.Zflag > 0)
		{
			var offset = _Memory.memory[++this.PC + _PCB.base];
			offset = parseInt(offset, 16);
			this.PC = ((this.PC + _PCB.base + offset) % (_Size + 1));
		}
		else
		{
			this.PC++;
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
			_PCB.Yreg = this.Yreg;
			while(_Memory.memory[yTemp] != "00")
			{
				_Console.putText(String.fromCharCode(parseInt(_Memory.memory[yTemp], 16)));
				yTemp++;
			}
			_Console.putText(" ");
		}
		this.ValidTick = 0;
	};
	
	this.CPUScheduler = function()
	{
		if(this.Quantum >= _Quantum)
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
		_PCB.PC = this.PC;
		_PCB.Acc = this.Acc;
		_PCB.Xreg = this.Xreg;
		_PCB.Yreg = this.Yreg;
		_PCB.Zflag = this.Zflag;
		
		if(!_PCB.isDone)
		{
			_ReadyQueue.enqueue(temp);
		}
		
		if(_ReadyQueue.isEmpty())
		{
			this.isExecuting = false;
			this.PC = 0;
			this.Acc = 0;
			this.Xreg = 0;
			this.Yreg = 0;
			this.Zflag = 0;
		}
		
		_PCB = _ReadyQueue.dequeue();
		if(_ReadyQueue.getSize() === 2)
		{
			document.getElementById('RQ3').innerHTML = temp.toString();
			var tempPCB2 = document.getElementById('RQ3').textContent;
			var tempPCB1 = document.getElementById('RQ2').textContent;
			document.getElementById('RQ2').innerHTML = tempPCB2;
			document.getElementById('RQ1').innerHTML = tempPCB1;
			document.getElementById('RQ3').innerHTML = "null";
		}
		else if (_ReadyQueue.getSize() === 1)
		{
			document.getElementById('RQ2').innerHTML = temp.toString();
			var tempPCB1 = document.getElementById('RQ2').textContent;
			document.getElementById('RQ1').innerHTML = tempPCB1;
			document.getElementById('RQ2').innerHTML = "null";
			document.getElementById('RQ3').innerHTML = "null";
		}
		else if(_ReadyQueue.getSize() === 0)
		{
			document.getElementById('RQ1').innerHTML = "null";
			document.getElementById('RQ2').innerHTML = "null";
			document.getElementById('RQ3').innerHTML = "null";
		}
		this.PC = _PCB.PC;
		this.Acc = _PCB.Acc;
		this.Xreg = _PCB.Xreg;
		this.Yreg = _PCB.Yreg;
		this.Zflag = _PCB.Zflag;
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
}
