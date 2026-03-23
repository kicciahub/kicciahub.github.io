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
        luaparse.parse(input);

        // Generate the 20-34x KICCIAHUB header
        const repeatCount = Math.floor(Math.random() * (34 - 20 + 1)) + 20;
        const kicciaHeader = "--[KICCIAHUB] ".repeat(repeatCount);

        // Watermark is index 1
        let pool = [toByteString("KICCIAHUB MADE THIS")]; 
        
        // Find strings and replace with table lookups
        let mangled = input.replace(/"(.*?)"|'(.*?)'/g, (m, p1, p2) => {
            let content = p1 || p2 || "";
            pool.push(toByteString(content));
            return `_S[${scramble(pool.length)}]`;
        });

        // Minify: Remove comments and force ONE LINE
        mangled = mangled
            .replace(/--\[\[[\s\S]*?\]\]/g, "") 
            .replace(/--.*$/gm, "")             
            .replace(/\s+/g, " ")               
            .trim();

        const tableData = pool.map(s => `"${s}"`).join(";");
        
        // THE FINAL TEMPLATE - NO SENTINEL REFERENCES
        const final = `--[[ KICCIAHUB_PRO | https://kicciahub.github.io/ ]]\n${kicciaHeader}\nreturn(function(...) local _S={${tableData}} local function _D(e) return _S[e] end local _ENV=(getfenv and getfenv() or _ENV) return (function(...) ${mangled} end)(...) end)(...)`;

        document.getElementById('output').value = final;
        document.getElementById('status-msg').innerHTML = `<span class="dot"></span> ENCRYPTION_SUCCESS`;
    } catch (e) {
        document.getElementById('status-msg').innerHTML = `<span style="color:red">!</span> SYNTAX_ERROR`;
        alert("Compile Error: " + e.message);
    }
}
