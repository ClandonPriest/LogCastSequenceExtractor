document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area') as HTMLDivElement;
    const fileElem = document.getElementById('fileElem') as HTMLInputElement;
    const browseText = document.getElementById('browseText') as HTMLSpanElement;
    const result = document.getElementById('result') as HTMLParagraphElement;
    const processLogButton = document.getElementById('processLogButton') as HTMLButtonElement;
    const notification = document.getElementById('notification') as HTMLDivElement;
    const toggleSwitch = document.getElementById('toggleModeSwitch') as HTMLInputElement;
    const modeLabel = document.getElementById('modeLabel') as HTMLSpanElement;
    let selectedAllies = new Set<string>();
    let uploadedLines: string[] = [];


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
        } else {
            modeLabel.textContent = "Toggle Light Mode";
        }
    });

    result.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(result.innerText);
            showNotification("✅ Copied to clipboard!");
        } catch (err) {
            console.error('Clipboard copy failed', err);
        }
    });

    const footer = document.getElementById('footer') as HTMLElement;

    setTimeout(() => {
    footer.style.opacity = '1';
    footer.style.transform = 'translateY(0)';
    }, 500); // small delay so it feels intentional


    function handleDrop(e: DragEvent) {
        e.preventDefault();
        dropArea.classList.remove('highlight');
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            handleFiles({ target: { files } } as unknown as Event);
        }
    }

    function handleFiles(e: Event) {
        const input = e.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const text = (event.target as FileReader).result as string;
            uploadedLines = text.split('\n').filter(line => line.trim() !== '');
    
            displayTargetSelection(uploadedLines);
        };
        reader.readAsText(file);
    }

    function displayTargetSelection(lines: string[]) {
        const targetContainer = document.getElementById('targetSelectionContainer') as HTMLDivElement;
        const targetsGrid = document.getElementById('targetsGrid') as HTMLDivElement;
    
        targetContainer.style.display = 'block';
        targetsGrid.innerHTML = '';
    
        const uniqueTargets = new Set<string>();
    
        for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].split(',');
            if (columns.length < 4) continue;
    
            const fullTargetField = columns[3].trim().replace(/["/]/g, '');
            const splitTarget = fullTargetField.split('→');
            let targetName = splitTarget.length > 1 ? splitTarget[1].trim() : fullTargetField;
            
            
            if (targetName) uniqueTargets.add(targetName.replace(/["/]/g, ''));
        }
    
        uniqueTargets.forEach(target => {
            const div = document.createElement('div');
            div.className = 'targetItem';
            div.innerText = target;
    
            div.addEventListener('click', () => {
                if (div.classList.contains('selected')) {
                    div.classList.remove('selected');
                    selectedAllies.delete(target.toLowerCase());
                } else {
                    div.classList.add('selected');
                    selectedAllies.add(target.toLowerCase());
                }
            });
    
            targetsGrid.appendChild(div);
        });
    }

    function processCSV(csvText: string) {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        if (lines.length < 2) {
            result.innerText = "Invalid CSV or no data.";
            return;
        }

        const ignoreSpells = new Set<string>([
            "Tempered Potion",
            "House of Cards",
            "Fade",
            "Desperate Prayer",
            "Pain Suppression"
        ]);

        const output: string[] = [];

        for (let i = 1; i < lines.length; i++) {
            const columns = lines[i].split(',');

            if (columns.length < 4) continue;

            let rawSpellName = columns[2].trim();
            const fullTargetField = columns[3].trim().replace(/["/]/g, '');
            const splitTarget = fullTargetField.split('→');
            let targetName = splitTarget.length > 1 ? splitTarget[1].trim() : fullTargetField;
            

            if (!rawSpellName) continue;

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
                } else {
                    spellName = "Penance (D)";
                }
            }
            

            output.push(spellName);
        }

        result.innerText = output.join('\n'); 
        showNotification("✅ File Loaded!");
        
    }

    function showNotification(message: string) {
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
    
    const clearButton = document.getElementById('clearButton') as HTMLButtonElement;

    clearButton.addEventListener('click', () => {
        result.innerText = "Your processed spells will appear here...";
    
        const fileElem = document.getElementById('fileElem') as HTMLInputElement;
        fileElem.value = "";
    
        // Deselect all ally selections
        const allTargetItems = document.querySelectorAll('.targetItem');
        allTargetItems.forEach(item => item.classList.remove('selected'));
    
        // Clear selectedAllies Set
        selectedAllies.clear();
    
        // (Optional) Hide target selection container
        const targetContainer = document.getElementById('targetSelectionContainer') as HTMLDivElement;
        targetContainer.style.display = 'none';
    });
    

    processLogButton.addEventListener('click', () => {
        if (uploadedLines.length > 0) {
            processCSV(uploadedLines.join('\n'));
        }
    });
    
    
});
