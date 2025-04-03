// EMI Calculator Logic
function calculateEMI() {
    const principal = parseFloat(document.getElementById('loanAmount').value);
    const rate = parseFloat(document.getElementById('interestRate').value) / 1200;
    const months = parseFloat(document.getElementById('loanTenure').value);

    if (isNaN(principal) || isNaN(rate) || isNaN(months)) {
        alert('Please fill all fields with valid numbers');
        return;
    }

    const emi = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    const totalPayment = emi * months;
    const totalInterest = totalPayment - principal;

    // Update results
    document.getElementById('emiResult').innerHTML = `₹${emi.toFixed(2)}`;
    document.getElementById('totalPayment').innerHTML = `₹${totalPayment.toFixed(2)}`;
    document.getElementById('totalInterest').innerHTML = `₹${totalInterest.toFixed(2)}`;

    // Update chart
    updateChart(principal, totalInterest);
}

// Input validation
document.querySelectorAll('.calculator-input').forEach(input => {
    input.addEventListener('input', () => {
        calculateEMI();
    });
});

// Initialize chart
let loanChart;
function updateChart(principal, interest) {
    const ctx = document.getElementById('emiChart').getContext('2d');
    
    if (loanChart) loanChart.destroy();

    loanChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Principal Amount', 'Total Interest'],
            datasets: [{
                data: [principal, interest],
                backgroundColor: ['#2563eb', '#3b82f6'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '65%',
            plugins: {
                legend: { position: 'bottom' },
                tooltip: { enabled: false }
            }
        }
    });
}

// Initial calculation
calculateEMI();

// Eligibility Check Logic
document.getElementById('eligibilityForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const loanType = document.getElementById('loanType').value;
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value);
    const employmentType = document.getElementById('employmentType').value;
    const creditScore = document.getElementById('creditScore').value;
    const age = parseInt(document.getElementById('age').value);
    const existingEMIs = parseFloat(document.getElementById('existingEMIs').value) || 0;
    
    // Calculate eligibility
    let isEligible = true;
    let maxLoanAmount = 0;
    let interestRate = 0;
    let message = '';
    let statusClass = '';
    
    // Basic eligibility checks
    if (age < 21 || age > 65) {
        isEligible = false;
        message = 'You must be between 21 and 65 years of age to be eligible for a loan.';
        statusClass = 'eligibility-danger';
    } else if (monthlyIncome < 15000) {
        isEligible = false;
        message = 'Your monthly income does not meet our minimum requirement of ₹15,000.';
        statusClass = 'eligibility-danger';
    } else if (creditScore === 'poor') {
        isEligible = false;
        message = 'Your credit score is below our acceptable range. We recommend improving your credit score before applying.';
        statusClass = 'eligibility-danger';
    } else {
        // Calculate max loan amount (50% of annual income for personal loans)
        const annualIncome = monthlyIncome * 12;
        const existingAnnualEMIs = existingEMIs * 12;
        
        // Different calculations based on loan type
        if (loanType === 'personal') {
            maxLoanAmount = (annualIncome - existingAnnualEMIs) * 0.5;
            
            // Interest rate based on credit score
            if (creditScore === 'excellent') {
                interestRate = 10.5;
            } else if (creditScore === 'good') {
                interestRate = 12.5;
            } else { // fair or no score
                interestRate = 14.5;
            }
            
        } else if (loanType === 'home') {
            maxLoanAmount = (annualIncome - existingAnnualEMIs) * 5; // Higher multiplier for home loans
            
            if (creditScore === 'excellent') {
                interestRate = 8.5;
            } else if (creditScore === 'good') {
                interestRate = 9.5;
            } else { // fair or no score
                interestRate = 10.5;
            }
            
        } else if (loanType === 'business') {
            maxLoanAmount = (annualIncome - existingAnnualEMIs) * 0.7;
            
            if (creditScore === 'excellent') {
                interestRate = 12.0;
            } else if (creditScore === 'good') {
                interestRate = 13.5;
            } else { // fair or no score
                interestRate = 15.0;
            }
        }
        
        // Adjust based on employment type
        if (employmentType === 'self-employed') {
            interestRate += 0.5; // Slightly higher rate for self-employed
        } else if (employmentType === 'business') {
            interestRate += 0.25; // Slightly higher rate for business owners
        }
        
        // Format the message
        if (maxLoanAmount < 100000) {
            statusClass = 'eligibility-warning';
            message = `You are eligible for a limited loan amount. We recommend improving your financial profile.`;
        } else {
            statusClass = 'eligibility-success';
            message = `Congratulations! You are eligible for a loan.`;
        }
    }
    
    // Display the result
    const resultDiv = document.getElementById('eligibilityResult');
    const statusDiv = document.getElementById('eligibilityStatus');
    const detailsDiv = document.getElementById('eligibilityDetails');
    
    resultDiv.classList.remove('d-none');
    
    if (isEligible) {
        statusDiv.innerHTML = `<i class="fas fa-check-circle fa-3x ${statusClass}"></i><h4 class="mt-3 ${statusClass}">Eligible for Loan</h4>`;
        detailsDiv.innerHTML = `
            <div class="row mt-3">
                <div class="col-md-6 text-md-end">Maximum Loan Amount:</div>
                <div class="col-md-6 text-md-start"><strong>₹${maxLoanAmount.toFixed(2)}</strong></div>
            </div>
            <div class="row mt-2">
                <div class="col-md-6 text-md-end">Estimated Interest Rate:</div>
                <div class="col-md-6 text-md-start"><strong>${interestRate}% p.a.</strong></div>
            </div>
            <div class="row mt-2">
                <div class="col-md-6 text-md-end">Loan Type:</div>
                <div class="col-md-6 text-md-start"><strong>${loanType.charAt(0).toUpperCase() + loanType.slice(1)} Loan</strong></div>
            </div>
            <div class="alert alert-info mt-3">${message}</div>
        `;
        
        // Enable Apply Now button
        document.getElementById('applyNowBtn').disabled = false;
    } else {
        statusDiv.innerHTML = `<i class="fas fa-times-circle fa-3x ${statusClass}"></i><h4 class="mt-3 ${statusClass}">Not Eligible</h4>`;
        detailsDiv.innerHTML = `<div class="alert alert-danger mt-3">${message}</div>`;
        
        // Disable Apply Now button
        document.getElementById('applyNowBtn').disabled = true;
    }
    
    // Scroll to result
    resultDiv.scrollIntoView({ behavior: 'smooth' });
});

// Reset eligibility form
document.getElementById('recalculateBtn').addEventListener('click', function() {
    document.getElementById('eligibilityResult').classList.add('d-none');
    document.getElementById('eligibilityForm').reset();
});

// Apply Now button action
document.getElementById('applyNowBtn').addEventListener('click', function() {
    // Hide eligibility section and show application form
    document.getElementById('application').classList.remove('d-none');
    document.getElementById('application').scrollIntoView({ behavior: 'smooth' });
});

// Multi-step form navigation
const formSteps = document.querySelectorAll('.form-step');
const stepIndicators = document.querySelectorAll('.step');
const progressBar = document.querySelector('.progress-bar');
let currentStep = 0;

// Next step buttons
document.querySelectorAll('.next-step').forEach(button => {
    button.addEventListener('click', function() {
        // Validate current step (simplified validation for demo)
        const currentFormStep = formSteps[currentStep];
        const inputs = currentFormStep.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value) {
                isValid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });
        
        if (!isValid) {
            alert('Please fill all required fields before proceeding.');
            return;
        }
        
        // Move to next step
        if (currentStep < formSteps.length - 1) {
            formSteps[currentStep].classList.add('d-none');
            currentStep++;
            formSteps[currentStep].classList.remove('d-none');
            
            // Update step indicators
            stepIndicators.forEach((step, index) => {
                if (index === currentStep) {
                    step.classList.add('active');
                } else if (index < currentStep) {
                    step.classList.add('completed');
                } else {
                    step.classList.remove('active', 'completed');
                }
            });
            
            // Update progress bar
            const progress = ((currentStep + 1) / formSteps.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressBar.setAttribute('aria-valuenow', progress);
        }
    });
});

// Previous step buttons
document.querySelectorAll('.prev-step').forEach(button => {
    button.addEventListener('click', function() {
        if (currentStep > 0) {
            formSteps[currentStep].classList.add('d-none');
            currentStep--;
            formSteps[currentStep].classList.remove('d-none');
            
            // Update step indicators
            stepIndicators.forEach((step, index) => {
                if (index === currentStep) {
                    step.classList.add('active');
                } else if (index < currentStep) {
                    step.classList.add('completed');
                } else {
                    step.classList.remove('active', 'completed');
                }
            });
            
            // Update progress bar
            const progress = ((currentStep + 1) / formSteps.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressBar.setAttribute('aria-valuenow', progress);
        }
    });
});

// Form submission
document.getElementById('loanApplicationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Your loan application has been submitted successfully! Our team will contact you shortly.');
    // In a real application, you would send the form data to the server here
});

// Contact form submission
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    this.reset();
});

// 3D Animation Effects
document.addEventListener('DOMContentLoaded', function() {
    // Animate loan illustration
    const loanIllustration = document.querySelector('.loan-illustration');
    if (loanIllustration) {
        loanIllustration.style.opacity = '1';
        loanIllustration.style.transform = 'translateY(0)';
    }
    
    // Add 3D tilt effect to cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top; // y position within the element
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const deltaX = (x - centerX) / centerX * 10; // max 10 degrees
            const deltaY = (y - centerY) / centerY * 10; // max 10 degrees
            
            this.style.transform = `perspective(1000px) rotateX(${-deltaY}deg) rotateY(${deltaX}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
});

// Add SVG animation to the loan illustration
const createLoanIllustration = () => {
    const container = document.querySelector('.loan-illustration');
    if (!container) return;
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 500 400');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.filter = 'drop-shadow(0px 10px 15px rgba(0,0,0,0.1))';
    
    // Create a simple loan illustration
    // Background
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('x', '50');
    background.setAttribute('y', '100');
    background.setAttribute('width', '400');
    background.setAttribute('height', '250');
    background.setAttribute('rx', '20');
    background.setAttribute('fill', '#ffffff');
    
    // Card details
    const cardTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    cardTitle.setAttribute('x', '100');
    cardTitle.setAttribute('y', '150');
    cardTitle.setAttribute('fill', '#1e40af');
    cardTitle.setAttribute('font-size', '24');
    cardTitle.setAttribute('font-weight', 'bold');
    cardTitle.textContent = 'Personal Loan';
    
    // Loan amount
    const amountLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    amountLabel.setAttribute('x', '100');
    amountLabel.setAttribute('y', '190');
    amountLabel.setAttribute('fill', '#6b7280');
    amountLabel.setAttribute('font-size', '16');
    amountLabel.textContent = 'Loan Amount';
    
    const amount = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    amount.setAttribute('x', '100');
    amount.setAttribute('y', '220');
    amount.setAttribute('fill', '#111827');
    amount.setAttribute('font-size', '28');
    amount.setAttribute('font-weight', 'bold');
    amount.textContent = '₹5,00,000';
    
    // Interest rate
    const rateLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    rateLabel.setAttribute('x', '100');
    rateLabel.setAttribute('y', '260');
    rateLabel.setAttribute('fill', '#6b7280');
    rateLabel.setAttribute('font-size', '16');
    rateLabel.textContent = 'Interest Rate';
    
    const rate = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    rate.setAttribute('x', '100');
    rate.setAttribute('y', '290');
    rate.setAttribute('fill', '#111827');
    rate.setAttribute('font-size', '28');
    rate.setAttribute('font-weight', 'bold');
    rate.textContent = '10.5% p.a.';
    
    // Decorative elements
    const circle1 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle1.setAttribute('cx', '400');
    circle1.setAttribute('cy', '150');
    circle1.setAttribute('r', '30');
    circle1.setAttribute('fill', '#3b82f6');
    
    const circle2 = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle2.setAttribute('cx', '370');
    circle2.setAttribute('cy', '180');
    circle2.setAttribute('r', '20');
    circle2.setAttribute('fill', '#2563eb');
    
    // Append all elements to SVG
    svg.appendChild(background);
    svg.appendChild(cardTitle);
    svg.appendChild(amountLabel);
    svg.appendChild(amount);
    svg.appendChild(rateLabel);
    svg.appendChild(rate);
    svg.appendChild(circle1);
    svg.appendChild(circle2);
    
    // Append SVG to container
    container.appendChild(svg);
    
    // Add animation
    const animateElements = [circle1, circle2];
    animateElements.forEach((el, index) => {
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        animate.setAttribute('attributeName', 'r');
        animate.setAttribute('values', index === 0 ? '30;35;30' : '20;25;20');
        animate.setAttribute('dur', '3s');
        animate.setAttribute('repeatCount', 'indefinite');
        el.appendChild(animate);
    });
};

// Call the function when DOM is loaded
document.addEventListener('DOMContentLoaded', createLoanIllustration);