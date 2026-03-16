// 1. Function to switch pages
function showForm() {
    document.getElementById('landing').style.display = 'none';
    document.getElementById('formPage').style.display = 'block';
}

// 2. Helper: Resets everything to default
function closeAndReset() {
    const form = document.querySelector('.form-grid');
    const fields = form.querySelectorAll('input, select');
    const banner = document.querySelector('.status-banner');

    if (banner) banner.remove(); 
    form.reset(); 
    
    fields.forEach(field => {
        field.classList.remove('success', 'error');
        const errorSpan = field.parentNode.querySelector('.error-msg');
        if (errorSpan) errorSpan.textContent = "";
    });
}

// 3. Helper: Shows Red or Green banners
function showStatusBanner(message, type) {
    const form = document.querySelector('.form-grid');
    const existingBanner = document.querySelector('.status-banner');
    if (existingBanner) existingBanner.remove();

    const banner = document.createElement('div');
    banner.className = `status-banner ${type}-banner`;
    const bgColor = type === 'success' ? '#00a651' : '#e63946';

    banner.style.cssText = `grid-column: 1 / -1; background-color: ${bgColor}; color: white; padding: 12px 20px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; font-size: 14px; font-weight: 500;`;
    
    const closeAction = type === 'success' ? 'closeAndReset()' : 'this.parentElement.remove()';
    
    banner.innerHTML = `
        <span>${message}</span>
        <span style="cursor:pointer; font-size: 20px; font-weight:bold;" onclick="${closeAction}">✕</span>
    `;

    form.prepend(banner);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.form-grid');
    const fields = form.querySelectorAll('input, select');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    function checkField(field) {
        const val = field.value.trim();
        const inputDate = new Date(val);
        inputDate.setHours(0, 0, 0, 0);
        
        let isValid = true;
        let message = "";
        const errorSpan = field.parentNode.querySelector('.error-msg');

        if (field.hasAttribute('required') && !val) {
            isValid = false;
            message = "This field is required";
        } 
        else if (['firstName', 'lastName', 'placeOfBirth'].includes(field.id)) {
            if (val.length < 2) { 
                isValid = false; 
                message = "Must be at least 2 characters"; 
            }
        } 
        else if (field.id === 'dob') {
            if (!val || inputDate >= today) { 
                isValid = false; 
                message = "Must be before today's date"; 
            }
        } 
        else if (field.id === 'dateJoined') {
            if (!val || inputDate < today) { 
                isValid = false; 
                message = "Must be today or after today"; 
            }
        }

        field.classList.toggle('error', !isValid);
        field.classList.toggle('success', isValid && val !== "");
        if (errorSpan) errorSpan.textContent = isValid ? "" : "⚠ " + message;
        
        return isValid;
    }

    fields.forEach(field => {
        if (!field.parentNode.querySelector('.error-msg')) {
            const span = document.createElement('span');
            span.className = 'error-msg';
            span.style.cssText = "color: red; font-size: 11px; display: block; text-align: right; margin-top: 5px;";
            field.parentNode.appendChild(span);
        }
        field.addEventListener('input', () => checkField(field));
    });

    // --- UPDATED SUBMIT LOGIC ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let formIsValid = true;

        fields.forEach(field => {
            if (!checkField(field)) formIsValid = false;
        });

        if (formIsValid) {
            // 1. Collect all data from the form
            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                dob: document.getElementById('dob').value,
                placeOfBirth: document.getElementById('placeOfBirth').value,
                gender: document.querySelector('input[name="gender"]:checked').value,
                nationality: document.getElementById('nationality').value,
                maritalStatus: document.getElementById('maritalStatus').value,
                settlementCamp: document.getElementById('settlementCamp').value,
                dateJoined: document.getElementById('dateJoined').value,
                password: "UserPassword123" // Placeholder password
            };

            try {
                // 2. Send the data to your Node.js server
                const response = await fetch('http://localhost:3000/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    showStatusBanner("Beneficiary registered successfully", "success");
                } else {
                    showStatusBanner(`Error: ${result.error || "Submission failed"}`, "error");
                }
            } catch (err) {
                showStatusBanner("Server error: Is your backend running on port 3000?", "error");
            }
        } else {
            showStatusBanner("Please correct the errors in the form", "error");
        }
    });
});
