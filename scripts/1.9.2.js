/*
PLANS:
1. add a crypto key patcher
2. add more cool things (such as a debug menu?)
3. switch from libc's connect function to getaddrinfo or some sort of method that uses libg and dosent rely on external stuff
*/

const Libg = {
    base: Module.findBaseAddress('libg.so'),
    offset(addr) {
        return this.base.add(addr);
    }
};

// fuck supercell i have to add this junk to write strings
const unlock = function(addr) {
    const target = Libg.offset(addr);
    const pageSize = Process.pageSize;
    const pageStart = target.and(ptr(-pageSize));

    Memory.protect(pageStart, pageSize, 'rw-');
};

var ntohs = new NativeFunction(Module.findExportByName('libc.so', 'ntohs'), 'uint16', ['uint16']);
var inet_addr = new NativeFunction(Module.findExportByName('libc.so', 'inet_addr'), 'int', ['pointer']);

var saharlol = {
    TIDS: function() {
        unlock(0x43F267);
        unlock(0x43F286);
        unlock(0x43F2C4);
        unlock(0x43F2A6);
        unlock(0x4420C1);
        unlock(0x43108B);
        
        // idk some of the strings maybe commented as the wrong tid i forgot
        Memory.writeUtf8String(Libg.offset(0x43F267), "meow"); // TID_BUTTON_HELP
        Memory.writeUtf8String(Libg.offset(0x43F286), "meow"); // TID_BUTTON_PRIVACY
        Memory.writeUtf8String(Libg.offset(0x43F2C4), "meow"); // TID_BUTTON_PARRENTS
        Memory.writeUtf8String(Libg.offset(0x43F2A6), "meow"); // TID_BUTTON_TOS
        Memory.writeUtf8String(Libg.offset(0x4420C1), "meow"); // TID_TAB_BATTLE
        Memory.writeUtf8String(Libg.offset(0x43108B), "Settings"); // TID_SETTINGS
    },

    redirectConnection: function(address, port) {
        Interceptor.attach(Module.findExportByName('libc.so', 'connect'), {
            onEnter: function(args) {
                if (ntohs(Memory.readU16(args[1].add(2))) === 9339) {
                    Memory.writeU16(args[1].add(2), ntohs(port));
                    Memory.writeInt(args[1].add(4), inet_addr(Memory.allocUtf8String(address)));
                }
            }
        });
    }
};

rpc.exports = {
    init: function(stage, options) {
        Interceptor.detachAll();
        saharlol.TIDS();
        saharlol.redirectConnection("192.168.1.22", 9339);
    }
};
