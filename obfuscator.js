// Helper: Turns 1 into (math) for confusing lookups
function scramble(n) {
    const seed = Math.floor(Math.random() * 5000) + 1000;
    return `(${seed + n}-${seed})`;
}

// Helper: Converts strings to Hex-style byte escapes
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
        // 1. Validate Luau Syntax using luaparse
        luaparse.parse(input);

        // 2. Generate Random KiciaHUB Header (20-34 times)
        const repeatCount = Math.floor(Math.random() * (34 - 20 + 1)) + 20;
        const header = "--[KiciaHUB] ".repeat(repeatCount);

        let pool = [];
        // 3. Extract strings and replace with table lookups (_S[index])
        let mangled = input.replace(/"(.*?)"|'(.*?)'/g, (m, p1, p2) => {
            let content = p1 || p2 || "";
            pool.push(toByteString(content));
            return `_S[${scramble(pool.length)}]`;
        });

        // 4. Minification: Strip comments and collapse into one line
        mangled = mangled
            .replace(/--\[\[[\s\S]*?\]\]/g, "") // Remove multi-line comments
            .replace(/--.*$/gm, "")             // Remove single-line comments
            .replace(/\s+/g, " ")               // Turn all newlines/tabs into single spaces
            .trim();

        const tableData = pool.map(s => `"${s}"`).join(";");
        
        // 5. Build Final Single-Line Output
        const final = `${header}\nreturn(function(...) local _S={"${toByteString("KiciaHUB_PRO")}";${tableData}} local function _D(e) return _S[e] end local _ENV=(getfenv and getfenv() or _ENV) return (function(...) ${mangled} end)(...) end)(...)`;

        document.getElementById('output').value = final;
        document.getElementById('status-msg').innerHTML = `<span class="dot"></span> ENCRYPTION_SUCCESS`;
    } catch (e) {
        document.getElementById('status-msg').innerHTML = `<span style="color:red">!</span> SYNTAX_ERROR`;
        alert("Compile Error: " + e.message);
    }
}
