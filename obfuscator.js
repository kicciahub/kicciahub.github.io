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
        // 1. Validate Luau Syntax
        luaparse.parse(input);

        // 2. Generate Random KICCIAHUB Header (20-34 times)
        const repeatCount = Math.floor(Math.random() * (34 - 20 + 1)) + 20;
        const header = "--[KICCIAHUB] ".repeat(repeatCount);

        // 3. String Pooling & Watermarking
        // We put your watermark at index 1 of the table
        let pool = [toByteString("KICCIAHUB MADE THIS")]; 
        
        let mangled = input.replace(/"(.*?)"|'(.*?)'/g, (m, p1, p2) => {
            let content = p1 || p2 || "";
            pool.push(toByteString(content));
            return `_S[${scramble(pool.length)}]`;
        });

        // 4. Minification (Remove comments and force one-line)
        mangled = mangled
            .replace(/--\[\[[\s\S]*?\]\]/g, "") 
            .replace(/--.*$/gm, "")             
            .replace(/\s+/g, " ")               
            .trim();

        const tableData = pool.map(s => `"${s}"`).join(";");
        const website = "https://kicciahub.github.io/";
        
        // 5. Build Final Single-Line Output
        // The watermark is sitting at _S[1] but isn't necessarily called, 
        // making it a "ghost" watermark that stays in the memory.
        const final = `--[[ KICCIAHUB_PRO | ${website} ]]\n${header}\nreturn(function(...) local _S={${tableData}} local function _D(e) return _S[e] end local _ENV=(getfenv and getfenv() or _ENV) return (function(...) ${mangled} end)(...) end)(...)`;

        document.getElementById('output').value = final;
        document.getElementById('status-msg').innerHTML = `<span class="dot"></span> ENCRYPTION_SUCCESS`;
    } catch (e) {
        document.getElementById('status-msg').innerHTML = `<span style="color:red">!</span> SYNTAX_ERROR`;
        alert("Compile Error: " + e.message);
    }
}
