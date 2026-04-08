const hamburger = document.querySelector(".hamburger-menu");
const mobileMenu = document.getElementById("mobileMenu");

hamburger.addEventListener("click", (e) => {
  e.stopPropagation();
  mobileMenu.classList.toggle("active");
});

mobileMenu.addEventListener("click", (e) => {
  e.stopPropagation();
});

document.addEventListener("click", () => {
  mobileMenu.classList.remove("active");
});

function updateHeader() {
  const token = localStorage.getItem("token");
  const loggedIn = !!token;

  // ---- Desktop nav ----
  const navLinks = document.querySelector(".nav-links");
  if (navLinks) {
    const link = document.createElement("a");
    if (loggedIn) {
      link.href = "doner-account.html";
      link.classList.add("nav-link");
      link.textContent = "My Account";
    } else {
      link.href = "doner-login.html";
      link.classList.add("nav-link");
      link.textContent = "Login";
    }
    navLinks.appendChild(link);
  }

  // ---- Registration / Sign Out button ----
  const headerRight = document.querySelector(".header-right-side");  
  const existingBtn = headerRight.querySelector("a.action-btn");
  if (loggedIn) {
    existingBtn.href = "javascript:void(0)";
    existingBtn.className = "btn-secondary";
    existingBtn.textContent = "Sign Out";
    
    existingBtn.addEventListener("click", logout);
  } else {
    existingBtn.href = "doner-registration.html";
    existingBtn.className = "btn-primary";
    existingBtn.textContent = "Donor Registration";
  }

  // ---- Mobile menu ----
  const mobileMenu = document.getElementById("mobileMenu");
  if (mobileMenu) {
    const link = document.createElement("a");
    if (loggedIn) {
      link.href = "account.html";
      link.textContent = "My Account";
    } else {
      link.href = "doner-login.html";
      link.textContent = "Login";
    }
    mobileMenu.appendChild(link);
  }
}

function getUser() {
  return JSON.parse(localStorage.getItem("user") || "null");
}

function logout(e) {
  e?.preventDefault();
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "doner-login.html";
}
updateHeader();

// DONOR CARD MAKER
function donorCardHTML(donor, user) {
  const isLoggedIn = !!user;
  const isOwner = isLoggedIn && user.id === donor.added_by_user_id;
  const isClaimed = !!donor.claimed_by_user_id;

  const canModify = isOwner && !isClaimed;
  const showRestrictMessage = isOwner && isClaimed;
  
  return `
    <div class="donor-card" data-donor-id="${donor.id}">
      <div class="card-header">
        <h3>${donor.name}</h3>
        <span class="blood-badge">${donor.blood_group}</span>
      </div>
      <div class="location">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10m0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"/>
        </svg>
        <span>${donor.location}</span>
      </div>
      <p class="donation">Last Donation: ${donor.last_donation || "N/A"}</p>
      <div class="contact">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-.77a.678.678 0 0 0-.58.122l-2.19 1a12.518 12.518 0 0 1-5.657-5.657l1-2.19a.678.678 0 0 0 .122-.58L3.654 1.328z"/>
        </svg>
        <span>${donor.phone}</span>
      </div>

      ${
        isOwner
          ? `
        <div class="card-actions ${isClaimed ? 'restrict' : ''}">
          <button 
            class="btn-secondary"
            ${!canModify ? 'disabled' : ''}
            data-button-name="edit"
            data-donor='${JSON.stringify(donor)}'
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"></path>
            </svg>
            Edit
          </button>

          <button 
            class="btn-primary"
            ${!canModify ? 'disabled' : ''}
            data-button-name="delete"
            data-donor='${JSON.stringify(donor)}'
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"></path>
              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"></path>
            </svg>
            Delete
          </button>
        </div>
      `
          : ''
      }

      ${
        showRestrictMessage
          ? `
        <div class="restrict-message">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>This donor claimed this Information</span>
        </div>
      `
          : ''
      }
    </div>`;
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-button-name]');
  if (!btn) return;

  const donor = JSON.parse(btn.dataset.donor);
  const action = btn.dataset.buttonName;

  if (action === 'edit') openEditForm(donor);
  if (action === 'delete') confirmDelete(donor);
});

// ─── Donor Delete ───────────────────────────────────────────

function confirmDelete(donor) {
  const overlay = document.createElement('div');
  overlay.id = 'delete-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 2;
  `;

  const box = document.createElement('div');
  box.className = 'form-card';
  box.innerHTML = `
    <div class="form-grid">
      <span class="caption">Delete Donor</span>
      <p>Are you sure you want to delete <strong>${donor.name}</strong>? This action cannot be undone.</p>

      <div class="error-message" id="delete-error" style="display:none;"></div>

      <div class="form-row">
        <div class="form-field">
          <label>&nbsp;</label>
          <div style="display:flex; gap:8px;">
            <button type="button" id="delete-cancel" class="btn-secondary">Cancel</button>
            <button type="button" id="delete-confirm" class="btn-primary">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDeletePopup();
  });

  box.querySelector('#delete-cancel').addEventListener('click', closeDeletePopup);

  box.querySelector('#delete-confirm').addEventListener('click', () => {
    handleDeleteConfirm(donor.id, box);
  });
}

function closeDeletePopup() {
  document.getElementById('delete-overlay')?.remove();
}

function handleDeleteConfirm(donorId, box) {
  const token = localStorage.getItem('token');
  const errorDiv = box.querySelector('#delete-error');

  if (!token) {
    errorDiv.textContent = 'You are not loged in';
    errorDiv.style.display = 'block';
    return;
  }
  
  const confirmBtn = box.querySelector('#delete-confirm');

  // disable button to prevent double click
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Deleting...';
  errorDiv.style.display = 'none';

  fetch(`${API_BASE}/donors/delete`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ donor_id: donorId })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      document.querySelector(`[data-donor-id="${donorId}"]`)?.remove();
      closeDeletePopup();
    } else {
      // show error inside popup
      errorDiv.textContent = data.message || 'Failed to delete donor.';
      errorDiv.style.display = 'block';
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Delete';
    }
  })
  .catch(() => {
    errorDiv.textContent = 'Something went wrong. Please try again.';
    errorDiv.style.display = 'block';
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Delete';
  });
}

// ─── Donor Edit ───────────────────────────────────────────

function openEditForm(donor) {
  const overlay = document.createElement('div');
  overlay.id = 'edit-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 2;
  `;

  const box = document.createElement('div');

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const radioHTML = bloodGroups
    .map(bg => `<label>
      <input type="radio" name="blood_group" value="${bg}" ${donor.blood_group === bg ? 'checked' : ''}> ${bg}
    </label>`)
    .join('');

  box.innerHTML = `<div class="form-card">
    <form id="edit-donor-form" class="form-grid">
      <span class="caption">Edit Donor</span>
      <div class="form-row">
        <div class="form-field">
          <label for="edit-donor-name">Full Name</label>
          <input type="text" id="edit-donor-name" name="name" value="${donor.name || ''}" placeholder="ex: Mehedi Hasan">
        </div>
        <div class="form-field">
          <label for="edit-donor-phone">Phone Number</label>
          <input required type="tel" id="edit-donor-phone" name="phone" value="${donor.phone || ''}" placeholder="ex: +880123456789">
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label data-required="true">Blood Group</label>
          <div class="radio-group">${radioHTML}</div>
        </div>
        <div class="form-field">
          <label for="edit-donor-location">Location</label>
          <input required type="text" id="edit-donor-location" name="location" value="${donor.location || ''}" placeholder="Rajshahi, Dhaka, etc.">
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label for="edit-donor-last-donation">Last Blood Donation</label>
          <div class="date-input">
            <input type="date" id="edit-donor-last-donation" name="last_donation" value="${donor.last_donation || ''}">
            <span class="calendar-icon">📅</span>
          </div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-field">
          <label>&nbsp;</label>
          <div style="display:flex; gap:8px;">
            <button type="button" id="edit-cancel" class="btn-primary">Cancel</button>
            <button type="submit" class="btn-secondary">Save Changes</button>
          </div>
        </div>
      </div>

      <div class="form-messages">
        <div class="error-message" id="edit-error" style="display:none;"></div>
        <div class="success-message" id="edit-success" style="display:none;"></div>
      </div>
    </form>
  </div>`;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeEditForm();
  });

  box.querySelector('#edit-cancel').addEventListener('click', closeEditForm);

  box.querySelector('#edit-donor-form').addEventListener('submit', (e) => {
    e.preventDefault();
    handleEditSave({
      donor_id:      donor.id,
      name:          box.querySelector('#edit-donor-name').value,
      phone:         box.querySelector('#edit-donor-phone').value,
      location:      box.querySelector('#edit-donor-location').value,
      last_donation: box.querySelector('#edit-donor-last-donation').value,
      blood_group:   box.querySelector('input[name="blood_group"]:checked')?.value || donor.blood_group,
    }, box);
  });
}

function closeEditForm() {
  document.getElementById('edit-overlay')?.remove();
}

function handleEditSave(updatedDonor, box) {
  const token = localStorage.getItem('token');

  const submitBtn = box.querySelector('button[type="submit"]');
  const errorDiv  = box.querySelector('#edit-error');
  const successDiv = box.querySelector('#edit-success');

  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';
  errorDiv.style.display = 'none';
  successDiv.style.display = 'none';

  fetch(`${API_BASE}/donors/edit`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updatedDonor)
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      successDiv.textContent = 'Donor updated successfully.';
      successDiv.style.display = 'block';
      // update the card in DOM
      const card = document.querySelector(`[data-donor-id="${updatedDonor.id}"]`);
      if (card) card.replaceWith(createDonorCard(updatedDonor)); // if you have a card builder function
      setTimeout(() => closeEditForm(), 1000);
    } else {
      errorDiv.textContent = data.message || 'Failed to update donor.';
      errorDiv.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Changes';
    }
  })
  .catch(() => {
    errorDiv.textContent = 'Something went wrong. Please try again.';
    errorDiv.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Save Changes';
  });
}

document.querySelectorAll(".radio-group input[type='radio']").forEach(radio => {
  radio.addEventListener("change", () => {
    radio.closest(".radio-group").classList.remove("error");
  });
});
document.querySelectorAll(".radio-group label").forEach(label => {  
  label.setAttribute("tabindex", "0");
  label.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      label.querySelector("input[type='radio']").click();
    }
  });
});
