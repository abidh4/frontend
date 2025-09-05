

    const admitBtn = document.getElementById('admitBtn');
    const pendingBtn = document.getElementById('pendingBtn');
    const formContainer = document.getElementById('formContainer');
    const optionsContainer = document.getElementById('optionsContainer');
    const clearBtn = document.getElementById('clearBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const admitForm = document.getElementById('admitForm');
    const pendingContainer = document.getElementById('pendingContainer');
    const pendingTableBody = document.querySelector('#pendingTable tbody');
    const submissionResult = document.getElementById('submissionResult');
    const resultText = document.getElementById('resultText');
    const admitNewBtn = document.getElementById('admitNewBtn');
    const closeBtn = document.getElementById('closeBtn');

    // Show Admit Student Form
    admitBtn.addEventListener('click', () => {
      submissionResult.style.display = 'none'; // hide any previous message
      formContainer.style.display = 'block';
      pendingContainer.style.display = 'none';
      optionsContainer.style.display = 'none';
      // focus first field
      setTimeout(() => document.getElementById('studentName').focus(), 50);
    });

    // Clear form
    clearBtn.addEventListener('click', () => admitForm.reset());

    // Cancel form -> go back to options
    cancelBtn.addEventListener('click', () => {
      formContainer.style.display = 'none';
      optionsContainer.style.display = 'flex';
      submissionResult.style.display = 'none';
      admitForm.reset();
    });

    // Fetch and display pending requests
    pendingBtn.addEventListener('click', async () => {
      formContainer.style.display = 'none';
      pendingContainer.style.display = 'block';
      optionsContainer.style.display = 'none';
      submissionResult.style.display = 'none';

      try {
        const res = await fetch('/api/pending-requests'); // Replace with your API endpoint
        const data = await res.json();

        // Clear existing rows
        pendingTableBody.innerHTML = '';

        if (!Array.isArray(data) || data.length === 0) {
          const tr = document.createElement('tr');
          const td = document.createElement('td');
          td.setAttribute('colspan', '4');
          td.textContent = 'No pending requests found';
          tr.appendChild(td);
          pendingTableBody.appendChild(tr);
          return;
        }

        // Populate table rows
        data.forEach(item => {
          const tr = document.createElement('tr');

          const rollTd = document.createElement('td');
          rollTd.textContent = item.roll || '';
          tr.appendChild(rollTd);

          const hallTd = document.createElement('td');
          hallTd.textContent = item.hall || '';
          tr.appendChild(hallTd);

          const trxTd = document.createElement('td');
          trxTd.textContent = item.trxID || '';
          tr.appendChild(trxTd);

          const actionTd = document.createElement('td');
          const approveBtn = document.createElement('button');
          approveBtn.textContent = 'Approve';
          approveBtn.addEventListener('click', () => {
            alert(`Approved ${item.roll}`);
            // Optionally send approval request to API
          });
          actionTd.appendChild(approveBtn);
          tr.appendChild(actionTd);

          pendingTableBody.appendChild(tr);
        });
      } catch (err) {
        console.error('Error fetching pending requests:', err);
        pendingTableBody.innerHTML = `<tr><td colspan="4">Error fetching data</td></tr>`;
      }
    });

    const backBtn = document.getElementById('backBtn');
    backBtn.addEventListener('click', () => {
      pendingContainer.style.display = 'none';
      optionsContainer.style.display = 'flex';
    });

    // Form submission with fetch -> expects backend JSON { status: true | false }
    admitForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // hide previous messages
      submissionResult.style.display = 'none';
      submissionResult.classList.remove('success', 'error');

      const submitBtn = admitForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      // collect form data
      const formData = new FormData(admitForm);
      const payload = Object.fromEntries(formData.entries());

      try {
        const response = await fetch('http://localhost:3005/admit-student', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        // try to parse JSON even if HTTP status isn't 200
        const json = await response.json().catch(() => null);

        // If your backend returns { status: true } on success:
        if (json && json.status === true) {
          // Show success message and hide the form
          resultText.textContent = 'Request submitted. The administration will surely look into it.';
          submissionResult.classList.add('success');
          submissionResult.classList.remove('error');
          submissionResult.style.display = 'block';

          // hide the form and reset inputs
          formContainer.style.display = 'none';
          admitForm.reset();
        } else {
          // Show error message; keep the form so user can fix inputs
          const msg = (json && json.message) ? json.message : 'Submission failed. Please try again.';
          resultText.textContent = msg;
          submissionResult.classList.add('error');
          submissionResult.classList.remove('success');
          submissionResult.style.display = 'block';
        }
      } catch (err) {
        console.error('Network or server error:', err);
        resultText.textContent = 'Network error. Please check the server and try again.';
        submissionResult.classList.add('error');
        submissionResult.classList.remove('success');
        submissionResult.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });

    // Admit New -> show clean form and hide message
    admitNewBtn.addEventListener('click', () => {
      submissionResult.style.display = 'none';
      submissionResult.classList.remove('success', 'error');
      admitForm.reset();
      optionsContainer.style.display = 'none';
      pendingContainer.style.display = 'none';
      formContainer.style.display = 'block';
      setTimeout(() => document.getElementById('studentName').focus(), 50);
    });

    // Close -> go to initial state (options)
    closeBtn.addEventListener('click', () => {
      submissionResult.style.display = 'none';
      submissionResult.classList.remove('success', 'error');
      admitForm.reset();
      formContainer.style.display = 'none';
      pendingContainer.style.display = 'none';
      optionsContainer.style.display = 'flex';
    });