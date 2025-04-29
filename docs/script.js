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
    const processLogButton = document.getElementById('processLogButton');
    const notification = document.getElementById('notification');
    const toggleSwitch = document.getElementById('toggleModeSwitch');
    const modeLabel = document.getElementById('modeLabel');
    let selectedAllies = new Set();
    let uploadedLines = [];
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
            uploadedLines = text.split('\n').filter(line => line.trim() !== '');
            displayTargetSelection(uploadedLines);
        };
        reader.readAsText(file);
    }
    function displayTargetSelection(lines) {
        const targetContainer = document.getElementById('targetSelectionContainer');
        const targetsGrid = document.getElementById('targetsGrid');
        targetContainer.style.display = 'block';
        targetsGrid.innerHTML = '';
        const uniqueTargets = new Set();
        for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].split(',');
            if (columns.length < 4)
                continue;
            const fullTargetField = columns[3].trim().replace(/["/]/g, '');
            const splitTarget = fullTargetField.split('→');
            let targetName = splitTarget.length > 1 ? splitTarget[1].trim() : fullTargetField;
            if (targetName)
                uniqueTargets.add(targetName.replace(/["/]/g, ''));
        }
        uniqueTargets.forEach(target => {
            const div = document.createElement('div');
            div.className = 'targetItem';
            div.innerText = target;
            div.addEventListener('click', () => {
                if (div.classList.contains('selected')) {
                    div.classList.remove('selected');
                    selectedAllies.delete(target.toLowerCase());
                }
                else {
                    div.classList.add('selected');
                    selectedAllies.add(target.toLowerCase());
                }
            });
            targetsGrid.appendChild(div);
        });
    }
    function processCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
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
            const fullTargetField = columns[3].trim().replace(/["/]/g, '');
            const splitTarget = fullTargetField.split('→');
            let targetName = splitTarget.length > 1 ? splitTarget[1].trim() : fullTargetField;
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
                if (selectedAllies.has(targetName.toLowerCase())) {
                    spellName = "Penance (H)";
                }
                else {
                    spellName = "Penance (D)";
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
        // Deselect all ally selections
        const allTargetItems = document.querySelectorAll('.targetItem');
        allTargetItems.forEach(item => item.classList.remove('selected'));
        // Clear selectedAllies Set
        selectedAllies.clear();
        // (Optional) Hide target selection container
        const targetContainer = document.getElementById('targetSelectionContainer');
        targetContainer.style.display = 'none';
    });
    processLogButton.addEventListener('click', () => {
        if (uploadedLines.length > 0) {
            processCSV(uploadedLines.join('\n'));
        }
    });
});
