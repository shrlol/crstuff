/**
** Custom Royale 1.1 - 1.9.2 **
** https://github.com/shrlol/crstuff/ **
** Script by saharlol **
*/
const Libg = {
    base: Module.findBaseAddress('libg.so'),
    offset(addr) {
        return this.base.add(addr);
    }
};

console.log("Custom Royale 1.1 [1.9.2]\nRunning On:", Process.arch);

const Config = {
    Client:{
        IP: "192.168.1.22",
        Port: 9339,
        RC4Key: "fhsd6f86f67rt8fw78fw789we78r9789wer6re"
    },
    Texts:{
        HelpButton: "Help",
        PrivacyButton: "Privacy Policy",
        ParentsButton: "Parents Guide",
        TosButton: "Terms Of Service",
        BattleTab: "Custom Royale",
        Settings: "Settings"
    }
}

const Offsets = {
        CryptoKey: 0x45607F,
        NativeFontFormatString: 0x220D7C,
        StringTableGetString: 0x5E708,
        TID_BUTTON_HELP: 0x43F267,
        TID_BUTTON_PRIVACY: 0x43F286,
        TID_BUTTON_PARENTS: 0x43F2C4,
        TID_BUTTON_TOS: 0x43F2A6,
        TID_TAB_BATTLE: 0x4420C1,
        TID_SETTINGS: 0x43108B,
        BATTLE_PATCH_1: 0x1C27F0,
        BATTLE_PATCH_2: 0x1C2B40
};

const ntohs = new NativeFunction(Module.findExportByName('libc.so', 'ntohs'), 'uint16', ['uint16']);
const inet_addr = new NativeFunction(Module.findExportByName('libc.so', 'inet_addr'), 'int', ['pointer']);

var saharlol = {
    misc: {
        Strings: function(){ 
        unlock(Offsets.TID_BUTTON_HELP);
        unlock(Offsets.TID_BUTTON_PRIVACY);
        unlock(Offsets.TID_BUTTON_PARENTS);
        unlock(Offsets.TID_BUTTON_TOS);
        unlock(Offsets.TID_TAB_BATTLE);
        unlock(Offsets.TID_SETTINGS);
        unlock(Offsets.CryptoKey);
        
        Memory.writeUtf8String(Libg.offset(Offsets.TID_BUTTON_HELP), Config.Texts.HelpButton); 
        Memory.writeUtf8String(Libg.offset(Offsets.TID_BUTTON_PRIVACY), Config.Texts.PrivacyButton); 
        Memory.writeUtf8String(Libg.offset(Offsets.TID_BUTTON_PARENTS), Config.Texts.ParentsButton);
        Memory.writeUtf8String(Libg.offset(Offsets.TID_BUTTON_TOS), Config.Texts.TosButton);
        Memory.writeUtf8String(Libg.offset(Offsets.TID_TAB_BATTLE), Config.Texts.BattleTab);
        Memory.writeUtf8String(Libg.offset(Offsets.TID_SETTINGS), Config.Texts.Settings);
        Memory.writeUtf8String(Libg.offset(Offsets.CryptoKey), Config.Client.RC4Key);
        console.log("[*] Strings Replaced!")
        },
        Patches: function(){
Interceptor.replace(base.add(Offsets.StringTableGetString), new NativeCallback(function(idPtr) {
    const Native = new NativeFunction(base.add(Offsets.StringTableGetString), 'pointer', ['pointer'])
    const tid = idPtr.readUtf8String()

    if (tid === "INFO_BY_CLIENT_CONNECT") {
        return Native(Memory.allocUtf8String("CRF | Loading...")) // No Limit
    }

    if (tid === "TID_ABOUT") {
        return Native(Memory.allocUtf8String("pla")) // No Limit
    }

    if (tid === "TID_CREDITS") {
        return Native(Memory.allocUtf8String("<cfce000>A<cfdc100>b<cffa200>o<cffa200>u<cff6c00>t</c>")) // No Limit
    }
    
    return Native(idPtr)
}, 'pointer', ['pointer']))
        }
    },
    core: {
      Setup: function() {
        Interceptor.attach(Module.findExportByName('libc.so', 'connect'), {
            onEnter: function(args) {
                if (ntohs(Memory.readU16(args[1].add(2))) === 9339) {
                    Memory.writeU16(args[1].add(2), ntohs(Config.Client.Port));
                    Memory.writeInt(args[1].add(4), inet_addr(Memory.allocUtf8String(Config.Client.IP)));
                    console.log("[*] IP Redirected")
                }
            }
        });
    }
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
        //saharlol.misc.Patches();
        saharlol.misc.Strings();
        saharlol.core.Setup();
    }
};



