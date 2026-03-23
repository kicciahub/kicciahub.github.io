// Helper: Turns 1 into (math)
function scramble(n) {
    const seed = Math.floor(Math.random() * 5000) + 1000;
    return `(${seed + n}-${seed})`;
}

// Helper: Turns "Hi" into \072\105
function toByteString(str) {
    return str.split('').map(c => `\\${c.charCodeAt(0).toString().padStart(3, '0')}`).join('');
}

function copyCode() {
    const out = document.getElementById('output');
    out.select();
    document.execCommand('copy');
    const toast = document.getElementById('copy-toast');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2500);
}

function runObfuscation() {
    const input = document.getElementById('input').value;
    if (!input) return;

    try {
        // Validate Luau Syntax
        luaparse.parse(input);

        let pool = [];
        // Extract strings and replace with table lookups
        let mangled = input.replace(/"(.*?)"|'(.*?)'/g, (m, p1, p2) => {
            let content = p1 || p2 || "";
            pool.push(toByteString(content));
            return `_S[${scramble(pool.length)}]`;
        });

        const tableData = pool.map(s => `"${s}"`).join(";");
        const version = "1.0.5";
        
        // The Final Boilerplate Template
        const final = `--[[ SENTINEL_PRO v${version} | https://wearedevs.net/obfuscator ]]\n` +
        `return(function(...) local _S={"${toByteString("SENTINEL_BYPASS")}";${tableData}} ` +
        `local function _D(e) return _S[e] end local _ENV=(getfenv and getfenv() or _ENV) ` +
        `return (function(...) \n${mangled}\n end)(...) end)(...)`;

        document.getElementById('output').value = final;
        document.getElementById('status-msg').innerHTML = `<span class="dot"></span> ENCRYPTION_SUCCESS`;
    } catch (e) {
        document.getElementById('status-msg').innerHTML = `<span style="color:red">!</span> SYNTAX_ERROR`;
        alert("Compile Error: " + e.message);
    }
}
