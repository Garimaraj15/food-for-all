import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api/donations';

export const createDonation = async (donationData, photoFile) => {
  try {
    const formData = new FormData();

    // Append all donation data fields to FormData
    formData.append('user_id', donationData.user_id);
    formData.append('category_id', donationData.category_id);
    formData.append('food_name', donationData.food_name);
    formData.append('quantity', donationData.quantity);
    formData.append('nutrients', donationData.nutrients);
    formData.append('expiry_date', donationData.expiry_date);
    formData.append('status', donationData.status || 'available');
    formData.append('pickup_address', donationData.pickup_address);
    formData.append('pickup_from', donationData.pickup_from);
    formData.append('pickup_to', donationData.pickup_to);
    formData.append('pickup_days', JSON.stringify(donationData.pickup_days));
    formData.append('contact_preference', donationData.contact_preference);
    formData.append('additional_notes', donationData.additional_notes);
    formData.append('safety_confirmed', donationData.safety_confirmed);
    formData.append('share_contact_details', donationData.share_contact_details);

    // Attach photo if exists
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    // Send the request
    const response = await axios.post(`${API_URL}/create`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error creating donation:', error);
    throw error;
  }
};

export const getDonation = async (donationId) => {
  try {
    const response = await axios.get(`${API_URL}/${donationId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching donation:', error);
    throw error;
  }
};

export const updateDonation = async (donationId, donationData, photoFile) => {
  try {
    const formData = new FormData();

    // Append all donation data fields to FormData
    formData.append('category_id', donationData.category_id);
    formData.append('food_name', donationData.food_name);
    formData.append('quantity', donationData.quantity);
    formData.append('nutrients', donationData.nutrients);
    formData.append('expiry_date', donationData.expiry_date);
    formData.append('status', donationData.status);
    formData.append('pickup_address', donationData.pickup_address);
    formData.append('pickup_from', donationData.pickup_from);
    formData.append('pickup_to', donationData.pickup_to);
    formData.append('pickup_days', JSON.stringify(donationData.pickup_days));
    formData.append('contact_preference', donationData.contact_preference);
    formData.append('additional_notes', donationData.additional_notes);
    formData.append('safety_confirmed', donationData.safety_confirmed);
    formData.append('share_contact_details', donationData.share_contact_details);

    // Attach photo if exists
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    // Send the request
    const response = await axios.put(`${API_URL}/${donationId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating donation:', error);
    throw error;
  }
};

export const deleteDonation = async (donationId) => {
  try {
    const response = await axios.delete(`${API_URL}/${donationId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting donation:', error);
    throw error;
  }
};
