/**
** Custom Royale 1.9.2 **
** https://github.com/shrlol/crstuff/ **
** Script by saharlol **
*/
const Libg = {
    base: Module.findBaseAddress('libg.so'),
    offset(addr) {
        return this.base.add(addr);
    }
};

const Config = {
        // General
        IP: "127.0.0.1",
        Port: 9339,
        // Texts (TIDS)
        HelpButton: "Help",
        PrivacyButton: "Privacy Policy",
        ParentsButton: "Parents Guide",
        TosButton: "Terms Of Service",
        BattleTab: "Custom Royale",
        Settings: "Settings"
}

const Addresses = {
    armv7: {
        // Tids
        TID_BUTTON_HELP: 0x43F267,
        TID_BUTTON_PRIVACY: 0x43F286,
        TID_BUTTON_PARENTS: 0x43F2C4,
        TID_BUTTON_TOS: 0x43F2A6,
        TID_TAB_BATTLE: 0x4420C1,
        TID_SETTINGS: 0x43108B,
        // Battle Patches
        BATTLE_PATCH_1: 0x1C27F0,
        BATTLE_PATCH_2: 0x1C2B40
    },
    x86: {
        // Tids
        TID_BUTTON_HELP: 0x0,
        TID_BUTTON_PRIVACY: 0x0,
        TID_BUTTON_PARENTS: 0x0,
        TID_BUTTON_TOS: 0x0,
        TID_TAB_BATTLE: 0x0,
        TID_SETTINGS: 0x0,
        // Battle Patches
        BATTLE_PATCH_1: 0x27C140,
        BATTLE_PATCH_2: 0x27C660
    }
};

const Offsets = Process.arch === 'arm' ? Addresses.armv7 : Addresses.x86;

const ntohs = new NativeFunction(Module.findExportByName('libc.so', 'ntohs'), 'uint16', ['uint16']);
const inet_addr = new NativeFunction(Module.findExportByName('libc.so', 'inet_addr'), 'int', ['pointer']);

var saharlol = {
    misc: function() {
        unlock(Offsets.TID_BUTTON_HELP);
        unlock(Offsets.TID_BUTTON_PRIVACY);
        unlock(Offsets.TID_BUTTON_PARENTS);
        unlock(Offsets.TID_BUTTON_TOS);
        unlock(Offsets.TID_TAB_BATTLE);
        unlock(Offsets.TID_SETTINGS);
        
        Memory.writeUtf8String(Libg.offset(Offsets.TID_BUTTON_HELP), Config.HelpButton); 
        Memory.writeUtf8String(Libg.offset(Offsets.TID_BUTTON_PRIVACY), Config.PrivacyButton); 
        Memory.writeUtf8String(Libg.offset(Offsets.TID_BUTTON_PARENTS), Config.ParentsButton);
        Memory.writeUtf8String(Libg.offset(Offsets.TID_BUTTON_TOS), Config.TosButton);
        Memory.writeUtf8String(Libg.offset(Offsets.TID_TAB_BATTLE), Config.BattleTab);
        Memory.writeUtf8String(Libg.offset(Offsets.TID_SETTINGS), Config.Settings);
        
        if (Process.arch === 'arm') {
            // armv7
            Memory.writeU8(Libg.offset(Offsets.BATTLE_PATCH_1), 0xD1); // D0 -> D1
            Memory.writeU8(Libg.offset(Offsets.BATTLE_PATCH_2), 0x92); // 90 -> 92
        } else {
            // x86
            Memory.writeU8(Libg.offset(Offsets.BATTLE_PATCH_1), 0xEB); // 74 -> EB
            Memory.writeU8(Libg.offset(Offsets.BATTLE_PATCH_2), 0xC0); // 14 -> C0
            Memory.writeU8(Libg.offset(0x2908C0), 0xEB); // 75 -> EB
        }
    },
    redirectConnection: function() {
        Interceptor.attach(Module.findExportByName('libc.so', 'connect'), {
            onEnter: function(args) {
                if (ntohs(Memory.readU16(args[1].add(2))) === 9339) {
                    Memory.writeU16(args[1].add(2), ntohs(Config.Port));
                    Memory.writeInt(args[1].add(4), inet_addr(Memory.allocUtf8String(Config.IP)));
                }
            }
        });
    }
};

function unlock(addr) {
    const target = Libg.offset(addr);
    const pageSize = Process.pageSize;
    const pageStart = target.and(ptr(-pageSize));
    Memory.protect(pageStart, pageSize, 'rw-');
};

rpc.exports = {
    init: function(stage, options) {
        Interceptor.detachAll();
        saharlol.misc();
        saharlol.redirectConnection();
    }
};
