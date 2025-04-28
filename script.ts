document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area') as HTMLDivElement;
    const fileElem = document.getElementById('fileElem') as HTMLInputElement;
    const browseText = document.getElementById('browseText') as HTMLSpanElement;
    const result = document.getElementById('result') as HTMLParagraphElement;
    const notification = document.getElementById('notification') as HTMLDivElement;
    const toggleSwitch = document.getElementById('toggleModeSwitch') as HTMLInputElement;
    const modeLabel = document.getElementById('modeLabel') as HTMLSpanElement;

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
            processCSV(text);
        };
        reader.readAsText(file);
    }

    function processCSV(csvText: string) {
        const lines = csvText.split('\n').filter(line => line.trim() !== '');
        const bossTargetInput = document.getElementById('bossTarget') as HTMLInputElement;
        const bossTargetName = bossTargetInput.value.trim();
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
            let targetName = columns[3].trim();

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
                if (targetName.includes(bossTargetName)) {
                    spellName = "Penance (D)";
                } else {
                    spellName = "Penance (H)";
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
        fileElem.scrollIntoView({ behavior: "smooth" });
    });
    
});
