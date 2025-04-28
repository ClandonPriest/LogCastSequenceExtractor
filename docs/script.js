"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileElem = document.getElementById('fileElem');
    const browseText = document.getElementById('browseText');
    const result = document.getElementById('result');
    const notification = document.getElementById('notification');
    const toggleSwitch = document.getElementById('toggleModeSwitch');
    const modeLabel = document.getElementById('modeLabel');
    browseText.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent event bubbling
        fileElem.click();
    });
    dropArea.addEventListener('dragover', (e) => { e.preventDefault(); dropArea.classList.add('highlight'); });
    dropArea.addEventListener('dragleave', () => dropArea.classList.remove('highlight'));
    dropArea.addEventListener('drop', handleDrop);
    fileElem.addEventListener('change', handleFiles);
    toggleSwitch.addEventListener('change', () => {
        document.body.classList.toggle('light');
        if (document.body.classList.contains('light')) {
            modeLabel.textContent = "Toggle Dark Mode";
        }
        else {
            modeLabel.textContent = "Toggle Light Mode";
        }
    });
    result.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield navigator.clipboard.writeText(result.innerText);
            showNotification("✅ Copied to clipboard!");
        }
        catch (err) {
            console.error('Clipboard copy failed', err);
        }
    }));
    const footer = document.getElementById('footer');
    setTimeout(() => {
        footer.style.opacity = '1';
        footer.style.transform = 'translateY(0)';
    }, 500); // small delay so it feels intentional
    function handleDrop(e) {
        var _a;
        e.preventDefault();
        dropArea.classList.remove('highlight');
        const files = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.files;
        if (files && files.length > 0) {
            handleFiles({ target: { files } });
        }
    }
    function handleFiles(e) {
        var _a;
        const input = e.target;
        const file = (_a = input.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = function (event) {
            const text = event.target.result;
            processCSV(text);
        };
        reader.readAsText(file);
    }
    function processCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        const bossTargetInput = document.getElementById('bossTarget');
        const bossTargetName = bossTargetInput.value.trim();
        if (lines.length < 2) {
            result.innerText = "Invalid CSV or no data.";
            return;
        }
        const ignoreSpells = new Set([
            "Tempered Potion",
            "House of Cards",
            "Fade",
            "Desperate Prayer",
            "Pain Suppression"
        ]);
        const output = [];
        for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].split(',');
            if (columns.length < 4)
                continue;
            let rawSpellName = columns[2].trim();
            let targetName = columns[3].trim();
            if (!rawSpellName)
                continue;
            rawSpellName = rawSpellName.replace(/["/]/g, '').trim();
            if (lines[i].toLowerCase().includes('canceled')) {
                output.push('Dead GCD');
                continue;
            }
            rawSpellName = rawSpellName.replace(/\s*\d*\.?\d*\s*sec$/i, '').trim();
            let spellName = rawSpellName;
            if (spellName.toLowerCase().includes('premonition')) {
                spellName = 'Premonition';
            }
            if (spellName.toLowerCase() === 'dark reprimand') {
                spellName = 'Penance';
            }
            if (ignoreSpells.has(spellName)) {
                continue;
            }
            if (spellName === 'Penance') {
                if (targetName.includes(bossTargetName)) {
                    spellName = "Penance (D)";
                }
                else {
                    spellName = "Penance (H)";
                }
            }
            output.push(spellName);
        }
        result.innerText = output.join('\n');
        showNotification("✅ File Loaded!");
    }
    function showNotification(message) {
        notification.innerText = message;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 10); // Fade in quickly
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 2000); // Start fade out after 4 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 2500); // Fully remove after fade out
    }
    const clearButton = document.getElementById('clearButton');
    clearButton.addEventListener('click', () => {
        result.innerText = "Your processed spells will appear here...";
        const fileElem = document.getElementById('fileElem');
        fileElem.value = "";
        fileElem.scrollIntoView({ behavior: "smooth" });
    });
});
