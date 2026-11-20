
import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  signOut,
} from 'firebase/auth';

import { auth } from '../firebaseConfig';

type Props = {
  onBack: () => void;
  onEditProfile: () => void;
  onLogout: () => void;
};

export default function AccountSettings({
  onBack,
  onEditProfile,
  onLogout,
}: Props) {
  const [activeSection, setActiveSection] = useState<
    'none' | 'password' | 'faq' | 'support'
  >('none');

const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');
const [passwordLoading, setPasswordLoading] = useState(false);
const [passwordError, setPasswordError] = useState('');

const [passwordSuccess, setPasswordSuccess] = useState('');

const handleChangePassword = async () => {
  setPasswordError('');

  if (!currentPassword || !newPassword || !confirmPassword) {
    setPasswordError('Please fill in all password fields.');
    return;
  }

  if (newPassword.length < 8) {
    setPasswordError('New password must be at least 8 characters.');
    return;
  }

  if (newPassword !== confirmPassword) {
    setPasswordError('New passwords do not match.');
    return;
  }

  const user = auth.currentUser;

  if (!user || !user.email) {
    setPasswordError('Please log in again.');
    return;
  }

  setPasswordLoading(true);

  try {
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );

    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    
setPasswordSuccess('Your password has been updated successfully!');

    setActiveSection('none');
  } catch (error: any) {
    if (error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential') {
      setPasswordError('Current password is incorrect.');
    } else {
      setPasswordError('Unable to update password. Please try again.');
    }
  } finally {
    setPasswordLoading(false);
  }
};

  return (
    <ScrollView style={styles.container}>
      <Pressable onPress={onBack}>
        <Text style={styles.backText}>‹ Driver Profile</Text>
      </Pressable>

      <Text style={styles.title}>Account Settings</Text>
      <Text style={styles.subtitle}>
        Manage your account and get help
      </Text>

{passwordSuccess !== '' && (
  <Text style={{ color: 'green', fontWeight: 'bold', marginTop: 12, marginBottom: 12 }}>
    {passwordSuccess}
  </Text>
)}

      <Text style={styles.sectionTitle}>Account & Security</Text>

      <Pressable style={styles.row} onPress={onEditProfile}>
        <Text style={styles.rowText}>Edit Profile</Text>
        <Text>›</Text>
      </Pressable>

      <Pressable
        style={styles.row}
        onPress={() => setActiveSection('password')}
      >
        <Text style={styles.rowText}>Change Password</Text>
        <Text>›</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Help & Support</Text>

      <Pressable
        style={styles.row}
        onPress={() => setActiveSection('faq')}
      >
        <Text style={styles.rowText}>
          Frequently Asked Questions (FAQs)
        </Text>
        <Text>›</Text>
      </Pressable>

      <Pressable
        style={styles.row}
        onPress={() => setActiveSection('support')}
      >
        <Text style={styles.rowText}>Contact Support</Text>
        <Text>›</Text>
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>

  
{activeSection === 'password' && (
  <View style={{ marginTop: 24, padding: 16, borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 8 }}>
    <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
      Change Password
    </Text>

    <Text>Current Password</Text>
    <TextInput
      value={currentPassword}
      onChangeText={setCurrentPassword}
      placeholder="Enter current password"
      secureTextEntry
      autoCapitalize="none"
      style={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 12, marginBottom: 12 }}
    />

    <Text>New Password</Text>
    <TextInput
      value={newPassword}
      onChangeText={setNewPassword}
      placeholder="Enter new password"
      secureTextEntry
      autoCapitalize="none"
      style={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 12, marginBottom: 12 }}
    />

    <Text>Confirm New Password</Text>
    <TextInput
      value={confirmPassword}
      onChangeText={setConfirmPassword}
      placeholder="Confirm new password"
      secureTextEntry
      autoCapitalize="none"
      style={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 12, marginBottom: 12 }}
    />

    {passwordError !== '' && (
      <Text style={{ color: 'red', marginBottom: 12 }}>
        {passwordError}
      </Text>
    )}

    <Pressable
      onPress={handleChangePassword}
      disabled={passwordLoading}
      style={{ backgroundColor: '#333333', padding: 14, alignItems: 'center' }}
    >
      <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
        {passwordLoading ? 'Updating...' : 'Update Password'}
      </Text>
    </Pressable>

    <Pressable
      onPress={() => {
        setActiveSection('none');
        setPasswordError('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }}
      style={{ padding: 14, alignItems: 'center' }}
    >
      <Text>Cancel</Text>
    </Pressable>
  </View>
)}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  backText: {
    fontSize: 14,
    marginBottom: 20,
    color: '#555555',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222222',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 6,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
  },
  row: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#DDDDDD',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowText: {
    fontSize: 15,
    color: '#222222',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#BBBBBB',
    padding: 14,
    alignItems: 'center',
    marginTop: 28,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
  },
  placeholder: {
    marginTop: 20,
    color: '#666666',
  },
});
