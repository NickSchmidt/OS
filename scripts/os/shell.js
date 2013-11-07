/* ------------
   Shell.js
   
   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

function Shell() {
    // Properties
    this.promptStr   = ">";
    this.commandList = [];
    this.curses      = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
    this.apologies   = "[sorry]";
    // Methods
    this.init        = shellInit;
    this.putPrompt   = shellPutPrompt;
    this.handleInput = shellHandleInput;
    this.execute     = shellExecute;
}

function shellInit() {
    var sc = null;
    //
    // Load the command list.

    // ver
    sc = new ShellCommand();
    sc.command = "ver";
    sc.description = "- Displays the current version data.";
    sc.function = shellVer;
    this.commandList[this.commandList.length] = sc;
	
	//date
	sc = new ShellCommand();
	sc.command = "date";
	sc.description = "- Displays the date for today.";
	sc.function = shellDate;
	this.commandList[this.commandList.length] = sc;
	
	//whereami
	sc = new ShellCommand();
	sc.command = "whereami";
	sc.description = "- Displays your current location.";
	sc.function = shellWhereami;
	this.commandList[this.commandList.length] = sc;
	
	//status <string>
	sc = new ShellCommand();
	sc.command = "status";
	sc.description = " <string> - Displays what's on your mind.";
	sc.function = shellStatus;
	this.commandList[this.commandList.length] = sc;
	
	//surprise
	sc = new ShellCommand();
	sc.command = "surprise";
	sc.description = " - Type 'surprise' for a ... surprise...";
	sc.function = shellSurprise;
	this.commandList[this.commandList.length] = sc;
    
    // help
    sc = new ShellCommand();
    sc.command = "help";
    sc.description = "- This is the help command. Seek help.";
    sc.function = shellHelp;
    this.commandList[this.commandList.length] = sc;
	
	//load
	sc = new ShellCommand();
	sc.command = "load";
	sc.description = " - Loads information in program input.";
	sc.function = shellLoad;
	this.commandList[this.commandList.length] = sc;
	
	//bsod
	sc = new ShellCommand();
	sc.command = "bsod";
	sc.description = " - Only 1 way to find out.";
	sc.function = shellBsod;
	this.commandList[this.commandList.length] = sc;
    
    // shutdown
    sc = new ShellCommand();
    sc.command = "shutdown";
    sc.description = "- Shuts down the virtual OS but leaves the underlying hardware simulation running.";
    sc.function = shellShutdown;
    this.commandList[this.commandList.length] = sc;

    // cls
    sc = new ShellCommand();
    sc.command = "cls";
    sc.description = "- Clears the screen and resets the cursor position.";
    sc.function = shellCls;
    this.commandList[this.commandList.length] = sc;

    // man <topic>
    sc = new ShellCommand();
    sc.command = "man";
    sc.description = "<topic> - Displays the MANual page for <topic>.";
    sc.function = shellMan;
    this.commandList[this.commandList.length] = sc;
    
    // trace <on | off>
    sc = new ShellCommand();
    sc.command = "trace";
    sc.description = "<on | off> - Turns the OS trace on or off.";
    sc.function = shellTrace;
    this.commandList[this.commandList.length] = sc;

    // rot13 <string>
    sc = new ShellCommand();
    sc.command = "rot13";
    sc.description = "<string> - Does rot13 obfuscation on <string>.";
    sc.function = shellRot13;
    this.commandList[this.commandList.length] = sc;

    // prompt <string>
    sc = new ShellCommand();
    sc.command = "prompt";
    sc.description = "<string> - Sets the prompt.";
    sc.function = shellPrompt;
    this.commandList[this.commandList.length] = sc;
	
	// processes
	sc = new ShellCommand();
    sc.command = "processes";
    sc.description = "- display all running processes";
    sc.function = shellProcesses;
    this.commandList[this.commandList.length] = sc;
	
	// run <PID>
	sc = new ShellCommand();
	sc.command = "run";
	sc.description = " <PID> - Runs the program with PID.";
	sc.function = shellRun;
	this.commandList[this.commandList.length] = sc;
	
	// runall
	sc = new ShellCommand();
	sc.command = "runall";
	sc.description = " - Runs all programs in memory";
	sc.function = shellRunAll;
	this.commandList[this.commandList.length] = sc;
	
	// kill
	sc = new ShellCommand();
	sc.command = "kill";
	sc.description = " - The Sheriff is in town (it kills the programs)";
	sc.function = shellKill;
	this.commandList[this.commandList.length] = sc;
	
	// quantum <int>
	sc = new ShellCommand();
	sc.command = "quantum";
	sc.description = " - Sets the quantum for the processes";
	sc.function = shellQuantum;
	this.commandList[this.commandList.length] = sc;
	
    // processes - list the running processes and their IDs
    // kill <id> - kills the specified process id.

    //
    // Display the initial prompt.
    this.putPrompt();
}

function shellPutPrompt()
{
    _StdIn.putText(this.promptStr);
}

function shellHandleInput(buffer)
{
    krnTrace("Shell Command~" + buffer);
    // 
    // Parse the input...
    //
    var userCommand = new UserCommand();
    userCommand = shellParseInput(buffer);
    // ... and assign the command and args to local variables.
    var cmd = userCommand.command;
    var args = userCommand.args;
    //
    // Determine the command and execute it.
    //
    // JavaScript may not support associative arrays in all browsers so we have to
    // iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
    var index = 0;
    var found = false;
    while (!found && index < this.commandList.length)
    {
        if (this.commandList[index].command === cmd)
        {
            found = true;
            var fn = this.commandList[index].function;
        }
        else
        {
            ++index;
        }
    }
    if (found)
    {
        this.execute(fn, args);
    }
    else
    {
        // It's not found, so check for curses and apologies before declaring the command invalid.
        if (this.curses.indexOf("[" + rot13(cmd) + "]") >= 0)      // Check for curses.
        {
            this.execute(shellCurse);
        }
        else if (this.apologies.indexOf("[" + cmd + "]") >= 0)      // Check for apologies.
        {
            this.execute(shellApology);
        }
        else    // It's just a bad command.
        {
            this.execute(shellInvalidCommand);
        }
    }
}

function shellParseInput(buffer)
{
    var retVal = new UserCommand();

    // 1. Remove leading and trailing spaces.
    buffer = trim(buffer);

    // 2. Lower-case it.
    buffer = buffer.toLowerCase();

    // 3. Separate on spaces so we can determine the command and command-line args, if any.
    var tempList = buffer.split(" ");

    // 4. Take the first (zeroth) element and use that as the command.
    var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
    // 4.1 Remove any left-over spaces.
    cmd = trim(cmd);
    // 4.2 Record it in the return value.
    retVal.command = cmd;

    // 5. Now create the args array from what's left.
    for (var i in tempList)
    {
        var arg = trim(tempList[i]);
        if (arg != "")
        {
            retVal.args[retVal.args.length] = tempList[i];
        }
    }
    return retVal;
}

function shellExecute(fn, args)
{
    // We just got a command, so advance the line...
    _StdIn.advanceLine();
    // ... call the command function passing in the args...
    fn(args);
    // Check to see if we need to advance the line again
    if (_StdIn.CurrentXPosition > 0)
    {
        _StdIn.advanceLine();
    }
    // ... and finally write the prompt again.
    this.putPrompt();
}


//
// The rest of these functions ARE NOT part of the Shell "class" (prototype, more accurately), 
// as they are not denoted in the constructor.  The idea is that you cannot execute them from
// elsewhere as shell.xxx .  In a better world, and a more perfect JavaScript, we'd be
// able to make then private.  (Actually, we can. have a look at Crockford's stuff and Resig's JavaScript Ninja cook.)
//

//
// An "interior" or "private" class (prototype) used only inside Shell() (we hope).
//
function ShellCommand()     
{
    // Properties
    this.command = "";
    this.description = "";
    this.function = "";
}

//
// Another "interior" or "private" class (prototype) used only inside Shell() (we hope).
//
function UserCommand()
{
    // Properties
    this.command = "";
    this.args = [];
}


//
// Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
//
function shellInvalidCommand()
{
    _StdIn.putText("Invalid Command. ");
    if (_SarcasticMode)
    {
        _StdIn.putText("Duh. Go back to your Speak & Spell.");
    }
    else
    {
        _StdIn.putText("Type 'help' for a list of commands.");
    }
}

function shellCurse()
{
    _StdIn.putText("Oh, so that's how it's going to be, eh? Fine.");
    _StdIn.advanceLine();
    _StdIn.putText("Bitch.");
    _SarcasticMode = true;
}

function shellApology()
{
   if (_SarcasticMode) {
      _StdIn.putText("Okay. I forgive you. This time.");
      _SarcasticMode = false;
   } else {
      _StdIn.putText("For what?");
   }
}

function shellVer(args)
{
    _StdIn.putText(APP_NAME + " version " + APP_VERSION);    
}

function isDate()
{
	var d = new Date();
	return d;
}

function shellDate(args)
{
	_StdIn.putText("" + isDate());

}

// See: http://stackoverflow.com/questions/391979/get-client-ip-using-just-javascript
// to obtain and display local network IP.
function shellWhereami(args)
{
    if (window.XMLHttpRequest) 
		xmlhttp = new XMLHttpRequest();
    else 
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");

    xmlhttp.open("GET", "http://api.hostip.info/get_html.php", false);
    xmlhttp.send();

    hostipInfo = xmlhttp.responseText.split("\n");

    for (i = 0; hostipInfo.length >= i; i++) 
	{
        ipAddress = hostipInfo[i].split(":");
        if (ipAddress[0] === "IP") 
        {
            return _StdIn.putText("Your machine's local network IP is: " + ipAddress[1]);
            
        }
    }

    _StdIn.putText("unknown");
	//_StdIn.putText(myIP);
}

function shellSurprise(args)
{
	_StdIn.putText("Click 'Size of Elysium - OS' to check amount of space used");
}

function shellStatus(args)
{
	var i = 0;
	var status = "";
	while (i < args.length)
	{
		var status = status + args[i] + " ";
		i++;
	}
	//_StdIn.putText("" + args);
	
    if (args.length == 0)
    {
		_StdIn.putText("You aren't a robot. You have emotions...");
    }
	document.getElementById("status").innerHTML = status;
}

function shellBsod(args)
{
	krnTrapError();
}

function shellLoad(args)
{
	var programInput = document.getElementById("taProgramInput").value;
	var str = /[g-z]/gi; // a string of characters from g - z
	if(!str.test(programInput)) // if 0-9 or a-F is given, continue.
	{
		if(_NumPrograms >= 3)
		{
			_StdIn.putText("Error: File swapping unknown. Cannot compute");
		}
		else
		{
			if(_NumPrograms === 0)
			{
				var i = _First;
				_PCB1 = new PCB;
				_PCB1.init(_NumPrograms);
				document.getElementById("RL1").innerHTML = _PCB1.toString();
				_ResidentList.push(_PCB1.toString());
			}
			else if(_NumPrograms === 1)
			{
				var i = _Second;
				_PCB2 = new PCB;
				_PCB2.init(_NumPrograms);
				document.getElementById("RL2").innerHTML = _PCB2.toString();
				_ResidentList.push(_PCB2.toString());
			}
			else
			{
				var i = _Third;
				_PCB3 = new PCB;
				_PCB3.init(_NumPrograms);
				document.getElementById("RL3").innerHTML = _PCB3.toString();
				_ResidentList.push(_PCB3.toString());
			}
			var output = programInput.split(" ");
			var j = 0;
			while (j < output.length)
			{
				_Memory.memory[i] = output[j];
				document.getElementById(i).innerHTML = _Memory.memory[i];
				j++;
				i++;
			}
			_StdIn.putText("PID: " + _NumPrograms++);
		}
	}
	else
		//_StdIn.putText("false");
		_StdIn.putText("Invalid instruction. Initializing virus scan for protection");
	/*--------------------------------------------------------
	var memoryInput = programInput.split(" ");
	var i = 0;
	while (i < memoryInput.length)
	{
		document.getElementById(i).innerHTML = memoryInput[i];
		i++;
	} ---------------------------------------------------------*/

}

function shellHelp(args)
{
    _StdIn.putText("Commands:");
    for (var i in _OsShell.commandList)
    {
        _StdIn.advanceLine();
        _StdIn.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
    }    
}

function shellProcesses(args)
{
	if(!_CPU.isExecuting)
	{
		_StdIn.putText("Nothing is running");
	}
	else
	{
		if(!_PCB1.isDone)
		{
			_StdIn.putText(_PCB1.toString());
			_StdIn.advanceLine();
		}
		if(!_PCB2.isDone)
		{
			_StdIn.putText(_PCB2.toString());
			_StdIn.advanceLine();
		}
		if(!_PCB3.isDone)
		{
			_StdIn.putText(_PCB3.toString());
			_StdIn.advanceLine();
		}
	}
}

function shellRun(args)
{
	//_StdIn.putText("Alpaca"); -- can't just get rid of Alpaca :<
	if (args.length === 1)
	{
		if(args[0] === "0") // want to check what block we are working with
		{
			_CPU.PC = _First;
			_PCB1.isDone = false;
			document.getElementById("PC").innerHTML = _CPU.PC;
			if(_ReadyQueue.isEmpty())
			{
				_NumTimesRan = 0;
			}
			if(_NumTimesRan === 0)
			{
				document.getElementById("RQ1").innerHTML = _PCB1.toString();
				_NumTimesRan++;
			}
			else if(_NumTimesRan === 1)
			{
				document.getElementById("RQ2").innerHTML = _PCB1.toString();
				_NumTimesRan++;
			}
			else if(_NumTimesRan === 2)
			{
				document.getElementById("RQ3").innerHTML = _PCB1.toString();
				_NumTimesRan = 0;
			}
			_CPU.Scheduler(_PCB1);
			_CPU.isExecuting = true;
		}
		else if(args[0] === "1")
		{
			_CPU.PC = _Second;
			_CPU.Scheduler(_PCB2); // move the scheduler up here 
			_PCB2.isDone = false;
			document.getElementById("PC").innerHTML = _CPU.PC;
			if(_NumTimesRan === 0)
			{
				document.getElementById("RQ1").innerHTML = _PCB2.toString();
				_NumTimesRan++;
			}
			else if(_NumTimesRan === 1)
			{
				document.getElementById("RQ2").innerHTML = _PCB2.toString();
				_NumTimesRan++;
			}
			else if(_NumTimesRan === 2)
			{
				document.getElementById("RQ3").innerHTML = _PCB2.toString();
				_NumTimesRan = 0;
			}
			_CPU.isExecuting = true;
		}
		else if(args[0] === "2") 
		{
			_CPU.PC = _Third;
			_CPU.Scheduler(_PCB3);
			_PCB3.isDone = false;
			document.getElementById("PC").innerHTML = _CPU.PC;
			if(_NumTimesRan === 0)
			{
				document.getElementById("RQ1").innerHTML = _PCB3.toString();
				_NumTimesRan++;
			}
			else if(_NumTimesRan === 1)
			{
				document.getElementById("RQ2").innerHTML = _PCB3.toString();
				_NumTimesRan++;
			}
			else if(this.numTimesRan === 2)
			{
				document.getElementById("RQ3").innerHTML = _PCB3.toString();
				_NumTimesRan = 0;
			}
			_CPU.isExecuting = true;
		}
		// What else can be wrong? Maybe invalid process ID.
		else
		{
			_StdIn.putText("Invalid process ID");
		}
	}
	else
	{
		_StdIn.putText("Either no PID, or request for too many programs");
	}
}

function shellRunAll(args)
{
	_CPU.PC = _First;
	_CPU.Scheduler(_PCB1);
	_PCB1.isDone = false;
	_CPU.isExecuting = true;
	document.getElementById("PC").innerHTML = _CPU.PC;
	document.getElementById("RQ1").innerHTML = _PCB1.toString();
	if(_PCB2 != null)
	{
		_CPU.Scheduler(_PCB2);
		_PCB2.isDone = false;
		document.getElementById("RQ2").innerHTML = _PCB2.toString();
	}
	if(_PCB3 != null)
	{
		_CPU.Scheduler(_PCB3);
		_PCB3.isDone = false;
		document.getElementById("RQ3").innerHTML = _PCB3.toString();
	}
}

function shellQuantum(args)
{
	if(args.length > 0)
	{
		_Quantum = args[0];
	}
	else
	{
		_StdIn.putText("Please enter a quantum");
	}
}

function shellShutdown(args)
{
     _StdIn.putText("Shutting down...");
     // Call Kernel shutdown routine.
    krnShutdown();   
    // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
}

function shellCls(args)
{
    _StdIn.clearScreen();
    _StdIn.resetXY();
}

function shellMan(args)
{
    if (args.length > 0)
    {
        var topic = args[0];
        switch (topic)
        {
            case "help": 
                _StdIn.putText("Help displays a list of (hopefully) valid commands.");
                break;
            default:
                _StdIn.putText("No manual entry for " + args[0] + ".");
        }        
    }
    else
    {
        _StdIn.putText("Usage: man <topic>  Please supply a topic.");
    }
}

function shellTrace(args)
{
    if (args.length > 0)
    {
        var setting = args[0];
        switch (setting)
        {
            case "on": 
                if (_Trace && _SarcasticMode)
                {
                    _StdIn.putText("Trace is already on, dumbass.");
                }
                else
                {
                    _Trace = true;
                    _StdIn.putText("Trace ON");
                }
                
                break;
            case "off": 
                _Trace = false;
                _StdIn.putText("Trace OFF");                
                break;                
            default:
                _StdIn.putText("Invalid argument.  Usage: trace <on | off>.");
        }        
    }
    else
    {
        _StdIn.putText("Usage: trace <on | off>");
    }
}

function shellRot13(args)
{
    if (args.length > 0)
    {
        _StdIn.putText(args[0] + " = '" + rot13(args[0]) +"'");     // Requires Utils.js for rot13() function.
    }
    else
    {
        _StdIn.putText("Usage: rot13 <string>  Please supply a string.");
    }
}

function shellPrompt(args)
{
    if (args.length > 0)
    {
        _OsShell.promptStr = args[0];
    }
    else
    {
        _StdIn.putText("Usage: prompt <string>  Please supply a string.");
    }
}

// may as well put kill on the bottom. It's a dangerous weapon
function shellKill(args)
{
	// first check if there are any targets to shoot at
	if(!_CPU.isExecuting)
	{
		_StdIn.putText("Nothing to shoot at");
	}
	// then check where the whiskey process is. Whiskey = weak.
	else if (args.length > 0)
	{
		if(args[0] === "0")
		{
			// let's kill it and say that it's done executing.
			_PCB1.isDone = true;
		}
		else if(args[0] === "1")
		{
			_PCB2.isDone = true;
		}
		else if(args[0] === "2")
		{
			_PCB3.isDone = true;
		}
		else // The whiskey process was a false alarm :<
		{
			_StdIn.putText("That just goes to show you're nothing but a Whiskey Delta");
		}
	}
	else
	{
		_StdIn.putText("That just goes to show you're nothing but a Whiskey Delta");
	}
}
