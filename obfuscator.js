function runObfuscation() {
    const input = document.getElementById('input').value;
    
    try {
        // We still parse the AST to ensure the code is valid Luau
        luaparse.parse(input);
        
        let obfuscated = input;

        // 1. The XOR Encryption Logic
        obfuscated = obfuscated.replace(/"(.*?)"|'(.*?)'/g, (match, p1, p2) => {
            let str = p1 !== undefined ? p1 : p2;
            if (!str) return '""'; // Handle empty strings

            // Generate a random encryption key between 1 and 255 for THIS specific string
            let key = Math.floor(Math.random() * 255) + 1; 
            
            // Convert the string into an array of XOR'd byte numbers
            let encryptedBytes = Array.from(str).map(char => {
                return char.charCodeAt(0) ^ key; // The ^ symbol is XOR in JavaScript
            });

            // Replace the string with a call to our decryptor function
            return `_decrypt({${encryptedBytes.join(",")}}, ${key})`;
        });

        // 2. The Luau Decryptor Function (Injected at the top)
        // Luau uses the 'bit32' library for bitwise operations
        const decryptorCode = `
local function _decrypt(bytes, key)
    local result = ""
    for _, byteVal in ipairs(bytes) do
        result = result .. string.char(bit32.bxor(byteVal, key))
    end
    return result
end
`;

        // 3. Output the final package
        document.getElementById('output').value = decryptorCode + "\n" + obfuscated;
        
    } catch (e) {
        alert("Syntax Error in Luau Code: " + e.message);
    }
}
