const instrumentClasses = {
    "Select Class": ["Select Type"],
    "Drums": ["Drum Loop", "Bass Drum", "Snare Drum", "Tom-Tom", "Cymbal", "Hi-Hat", "Floor Tom", "Ride Cymbal", "Crash Cymbal"],
    "Bass": ["Acoustic Bass", "Electric Bass", "Synth Bass", "Fretless Bass", "Upright Bass", "5-String Bass"],
    "Guitar": ["Acoustic Guitar", "Electric Guitar", "Bass Guitar", "Classical Guitar", "12-String Guitar", "Resonator Guitar", "Pedal Steel Guitar"],
    "Vocals": ["Lead Vocals", "Backing Vocals", "Chorus", "Harmony", "Whisper", "Shout", "Speech", "Sounds"],
    "Percussion": ["Bongo", "Conga", "Tambourine", "Maracas", "Timpani", "Xylophone", "Triangle", "Djembe", "Cajon", "Tabla"],
    "Strings": ["Violin", "Viola", "Cello", "Double Bass", "Harp", "Mandolin", "Banjo", "Ukulele", "Sitar"],
    "Keys": ["Piano", "Analog Synth", "Digital Synth", "Modular Synth", "Wavetable Synth", "FM Synthesis", "Granular Synth", "Additive Synth"],
    "Sound Effects": ["Ambient", "Nature", "Industrial", "Electronic", "Urban", "Animals", "Weather", "Mechanical", "Sci-Fi"],
    "Brass": ["Trumpet", "Trombone", "Tuba", "French Horn", "Cornet", "Bugle", "Euphonium"],
    "Woodwinds": ["Flute", "Clarinet", "Oboe", "Bassoon", "Saxophone", "Recorder", "Piccolo", "English Horn"],
    "Keyboards": ["Piano", "Organ", "Harpsichord", "Accordion", "Mellotron", "Clavinet", "Celesta"],
    "Electronic": ["Sampler", "Drum Machine", "Sequencer", "Looper", "Effect Processor"]
};



const ipfs = IpfsHttpClient.create({ host: 'localhost', port: '5001', protocol: 'http' });


        async function getSTXPrice() {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd');
            const data = await response.json();
            return data.blockstack.usd;
        }

        async function getBTCPrice() {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
            const data = await response.json();
            return data.bitcoin.usd;
        }

        function attachClassDropdownListeners() {
            const classDropdowns = document.querySelectorAll('.instrumentClass');
            classDropdowns.forEach(dropdown => {
                dropdown.addEventListener('change', function() {
                    console.log("Class dropdown changed to:", this.value);
                    const typeDropdown = this.nextElementSibling;
                    updateTypeDropdown(typeDropdown, this.value);
                });
            });
        }
        

        async function loadFiles() {
            console.log("loadFiles function called");
        
            const stxPrice = await getSTXPrice();
            const btcPrice = await getBTCPrice();
            const files = document.getElementById('audioFiles').files;
            const formContainer = document.getElementById('formsContainer');
            formContainer.innerHTML = ''; // Clear existing forms
        
            let totalBtcCost = 0;
            let totalUsdCost = 0;
            let totalStxCost = 0; // Assuming 1 STX per file
        
            for (let file of files) {
                const fileSizeKB = file.size / 1024;
                const btcCost = (file.size * 6) / 100000000; // 6 sats per byte
                const usdCost = btcCost * btcPrice;
        
                totalBtcCost += btcCost;
                totalUsdCost += usdCost;
                totalStxCost += 1; // Assuming 1 STX per file
        
                const newForm = document.createElement('div');
                newForm.className = 'audioForm';
                const fileSizeColorClass = getFileSizeColorClass(fileSizeKB);
        
                // Create the Instrument Class dropdown
                const classDropdown = document.createElement('select');
                classDropdown.className = 'instrumentClass';
                classDropdown.name = 'instrumentClass';
        
                for (let className in instrumentClasses) {
                    const option = document.createElement('option');
                    option.value = className;
                    option.innerText = className;
                    classDropdown.appendChild(option);
                }
        
                // Create the Instrument Type dropdown
                const typeDropdown = document.createElement('select');
                typeDropdown.className = 'instrumentType';
        
                // Call the updateTypeDropdown function to set the initial values
                updateTypeDropdown(typeDropdown, classDropdown.value);
        
                // Append elements to the newForm
                newForm.appendChild(document.createElement('input')).setAttribute('type', 'text');
                newForm.lastChild.setAttribute('placeholder', 'File Name');
                newForm.lastChild.setAttribute('class', 'fileName');
                newForm.lastChild.setAttribute('value', file.name);
                newForm.appendChild(classDropdown);
                newForm.appendChild(typeDropdown);
                newForm.appendChild(document.createElement('input')).setAttribute('type', 'text');
                newForm.lastChild.setAttribute('placeholder', 'Creator Name');
                newForm.lastChild.setAttribute('class', 'creatorName');
                newForm.innerHTML += `
                    <div class="${fileSizeColorClass}">File Size: ${fileSizeKB.toFixed(2)} KB</div>
                    <div class="orange">Estimated Lowest Bitcoin Inscription Cost: ${btcCost.toFixed(8)} BTC ($${usdCost.toFixed(2)})</div>
                    <div class="green">Cost to mint STX Audional NFT: 1 STX / $${stxPrice.toFixed(2)}</div>
                `;
        
                // Append the newForm to the formContainer
                formContainer.appendChild(newForm);
        
                // After all forms are appended, attach the event listeners
                attachClassDropdownListeners();
        
                // Attach the event listener to the newly appended classDropdown
                classDropdown.addEventListener('change', function() {
                    console.log("Class dropdown changed to:", this.value);
                    const typeDropdown = this.nextElementSibling;
                    updateTypeDropdown(typeDropdown, this.value);
                });
            }
        
            // Update the totals section
            const btcTotalElement = document.getElementById('btcTotal');
            const stxTotalElement = document.getElementById('stxTotal');

            const totalBtcCostText = `Total Bitcoin Inscription Cost: ${totalBtcCost.toFixed(8)} BTC ($${totalUsdCost.toFixed(2)})`;
            const totalStxCostText = `Total STX Minting Cost: ${totalStxCost} STX ($${(totalStxCost * stxPrice).toFixed(2)})`;

            btcTotalElement.innerHTML = `<span class="orange">${totalBtcCostText}</span>`;
            stxTotalElement.innerHTML = `<span class="green">${totalStxCostText}</span>`;

        }
        
        function updateTypeDropdown(typeDropdown, selectedClass) {
            // Ensure the selectedClass matches the case in the instrumentClasses object
            selectedClass = capitalizeFirstLetter(selectedClass);
        
            const types = instrumentClasses[selectedClass];
            typeDropdown.innerHTML = ''; // Clear existing options
        
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.innerText = type;
                typeDropdown.appendChild(option);
            });
        
            // Add "User Defined" option
            const userDefinedOption = document.createElement('option');
            userDefinedOption.value = "User Defined";
            userDefinedOption.innerText = "User Defined";
            typeDropdown.appendChild(userDefinedOption);
        }
        
        // Helper function to capitalize the first letter of a string
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        
        
        // Helper function to determine the file size color class
        function getFileSizeColorClass(fileSizeKB) {
            if (fileSizeKB >= 0 && fileSizeKB < 1) {
                return 'bright-green';
            } else if (fileSizeKB >= 1 && fileSizeKB < 5) {
                return 'yellow';
            } else if (fileSizeKB >= 5 && fileSizeKB < 20) {
                return 'orange';
            } else if (fileSizeKB >= 20 && fileSizeKB < 100) {
                return 'pink';
            } else if (fileSizeKB >= 100 && fileSizeKB <= 350) {
                return 'red';
            } else {
                return 'black'; // Default color if out of range
            }
        }
        
        async function uploadAllToIPFS() {
            const forms = document.querySelectorAll('.audioForm');
            const files = document.getElementById('audioFiles').files;
            const linksContainer = document.getElementById('ipfsLinks');
            linksContainer.innerHTML = '';

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const form = forms[i];

                if (file.size / 1024 > 350) {
                    alert('Files must be under 350kb per file');
                    return;
                }

                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = async function () {
                    const base64Data = reader.result;
                    const jsonData = {
                        p: "audional",
                        op: "deploy",
                        audinal_id: "648e383daDbMUxq",
                        fileName: form.querySelector('.fileName').value,
                        instrumentClass: form.querySelector('.instrumentClass').value,
                        instrumentType: form.querySelector('.instrumentType').value,
                        creatorName: form.querySelector('.creatorName').value,
                        audioData: base64Data
                    };
                    const ipfsURL = await uploadToIPFS(jsonData);
                    const linkElement = document.createElement('div');
                    linkElement.innerText = `${jsonData.fileName}: ${ipfsURL}`;
                    linksContainer.appendChild(linkElement);
                };
            }
        }

        async function uploadToIPFS(data) {
            try {
                const file = {
                    path: 'audio.json',
                    content: new TextEncoder().encode(JSON.stringify(data))
                };

                const result = await ipfs.add(file);
                return `https://ipfs.io/ipfs/${result.cid.toString()}`;
            } catch (error) {
                console.error("Error in IPFS upload:", error);
                throw error;
            }
        }

        function copyLinksToClipboard() {
            const linksContainer = document.getElementById('ipfsLinks');
            const textToCopy = linksContainer.innerText;
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }