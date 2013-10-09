/* ----------------------------------
   DeviceDriverKeyboard.js
   
   Requires deviceDriver.js
   
   The Kernel Keyboard Device Driver.
   ---------------------------------- */

DeviceDriverKeyboard.prototype = new DeviceDriver;  // "Inherit" from prototype DeviceDriver in deviceDriver.js.

function DeviceDriverKeyboard()                     // Add or override specific attributes and method pointers.
{
    // "subclass"-specific attributes.
    // this.buffer = "";    // TODO: Do we need this?
    // Override the base method pointers.
    this.driverEntry = krnKbdDriverEntry;
    this.isr = krnKbdDispatchKeyPress;
    // "Constructor" code.
}

function krnKbdDriverEntry()
{
    // Initialization routine for this, the kernel-mode Keyboard Device Driver.
    this.status = "loaded";
    // More?
}

function krnKbdDispatchKeyPress(params)
{
    // Parse the params.    TODO: Check that they are valid and osTrapError if not.
    var keyCode = params[0];
    var isShifted = params[1];
    krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
    var chr = "";

    // Check to see if we even want to deal with the key that was pressed.
    if ( ((keyCode >= 65) && (keyCode <= 90)) ||   // A..Z
         ((keyCode >= 97) && (keyCode <= 123)) )   // a..z
    {
        // Determine the character we want to display.  
        // Assume it's lowercase
        chr = String.fromCharCode(keyCode + 32);
        // ... then check the shift key and re-adjust if necessary.
        if (isShifted)
        {
            chr = String.fromCharCode(keyCode);
        }
        // TODO: Check for caps-lock and handle as shifted if so.
        _KernelInputQueue.enqueue(chr);        
    }
	
    else if ( (keyCode == 32)                     ||   // space
              (keyCode == 13)                     ||   // enter
			  (keyCode == 8) )					     // backspace
    {
        chr = String.fromCharCode(keyCode);
        _KernelInputQueue.enqueue(chr); 
    }
	// -------------------------------- Character's edited by Nick -----------------
	// switch(keyCode)
	// {
	else if (keyCode == 48) {  // 0
		chr = String.fromCharCode(keyCode);
		if (isShifted)
		{
			chr = String.fromCharCode(keyCode - 7);
		}
		_KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 49) {  // 1
		chr = String.fromCharCode(keyCode);
		if (isShifted)
		{
			chr = String.fromCharCode(keyCode - 16);
		}
		_KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 50) {  // 2
		chr = String.fromCharCode(keyCode);
		if (isShifted)
		{
			chr = String.fromCharCode(keyCode + 14);
		}
		_KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 51) {  // 3
		chr = String.fromCharCode(keyCode);
		if (isShifted)
		{
			chr = String.fromCharCode(keyCode - 16);
		}
		_KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 52)  { // 4
		chr = String.fromCharCode(keyCode);
		if (isShifted)
		{
			chr = String.fromCharCode(keyCode - 16);
		}
		_KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 53) {  // 5
		chr = String.fromCharCode(keyCode);
		if (isShifted)
		{
			chr = String.fromCharCode(keyCode - 16);
		}
		_KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 54) {  // 6
		chr = String.fromCharCode(keyCode);
		if (isShifted)
		{
			chr = String.fromCharCode(keyCode + 40);
		}
		_KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 55) {  // 7
		chr = String.fromCharCode(keyCode);
		if (isShifted)
		{
			chr = String.fromCharCode(keyCode - 17);
		}
		_KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 56)  { // 8
		chr = String.fromCharCode(keyCode);
		if (isShifted)
		{
			chr = String.fromCharCode(keyCode - 14);
		}
		_KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 57) {  // 9
		chr = String.fromCharCode(keyCode);
		if (isShifted)
		{
			chr = String.fromCharCode(keyCode - 17);
		}
		_KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 190) {  // . - period
		chr = String.fromCharCode(keyCode - 144);
		if (isShifted)
		{
			chr = String.fromCharCode(keyCode - 128);
		}
		_KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 59) {   // ; - semicolon
		chr = String.fromCharCode(keyCode);
		if (isShifted)
		{
			chr = String.fromCharCode(keyCode - 1);
		}
		_KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 188) {  // , - comma
		chr = String.fromCharCode(keyCode - 144);
		if (isShifted)
		{
			chr = String.fromCharCode(keyCode - 128);
		}
		_KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 191)  { // / - forward slash
		chr = String.fromCharCode(47);
		if (isShifted)
		{
			chr = String.fromCharCode(63);
		}
		_KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 222)  { // ' - single quote
		chr = String.fromCharCode(39);
		if (isShifted)
		{
			chr = String.fromCharCode(34);
		}
		_KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 192) {  // ~ - tilda
		chr = String.fromCharCode(96);
		if (isShifted)
		{
			chr = String.fromCharCode(126);
		}
		_KernelInputQueue.enqueue(chr);
	}
	else if (keyCode == 16) { // allow shift to work
	}
	else if (keyCode == 38) { // up arrow key
		chr = String.fromCharCode(1337);
		_KernelInputQueue.enqueue(chr);
	}
	else
	{
		_StdIn.putText(" Invalid input.");
		chr = String.fromCharCode(13);
        _KernelInputQueue.enqueue(chr);
		//krnTrapError();
	}
		
}
