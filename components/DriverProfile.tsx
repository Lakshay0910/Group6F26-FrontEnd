import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebaseConfig';

type Props = {
  onOpenSettings: () => void;
};

export default function DriverProfile({
  onOpenSettings,
}: Props) {
  const user = auth.currentUser;

  const [name, setName] = useState(
    user?.displayName || ''
  );
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in first.');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }

    try {
      setSaving(true);
      await updateProfile(user, {
        displayName: name.trim(),
      });

      setEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
      Alert.alert('Error', 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Driver Profile</Text>
      <Text style={styles.subtitle}>
        View and manage your driver account
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Full Name</Text>

        {editing ? (
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
          />
        ) : (
          <Text style={styles.value}>
            {name || 'Driver'}
          </Text>
        )}

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>
          {user?.email || 'Not available'}
        </Text>

        <Pressable
          style={styles.button}
          disabled={saving}
          onPress={
            editing ? saveProfile : () => setEditing(true)
          }
        >
          <Text style={styles.buttonText}>
            {saving
              ? 'Saving...'
              : editing
              ? 'Save Changes'
              : 'Edit Profile'}
          </Text>
        </Pressable>

        {editing && (
          <Pressable
            style={styles.cancelButton}
            onPress={() => {
              setName(user?.displayName || '');
              setEditing(false);
            }}
          >
            <Text>Cancel</Text>
          </Pressable>
        )}
      </View>

      <Pressable
        style={styles.settingsRow}
        onPress={onOpenSettings}
      >
        <Text style={styles.settingsText}>
          Account Settings
        </Text>
        <Text>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#262626',
  },
  subtitle: {
    color: '#666666',
    marginTop: 5,
    marginBottom: 25,
  },
  card: {
    borderWidth: 1,
    borderColor: '#BABABA',
    padding: 20,
    borderRadius: 6,
  },
  label: {
    fontSize: 13,
    color: '#666666',
    marginTop: 15,
  },
  value: {
    fontSize: 16,
    color: '#262626',
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#BABABA',
    padding: 12,
    marginTop: 5,
    borderRadius: 4,
  },
  button: {
    backgroundColor: '#333333',
    padding: 14,
    marginTop: 25,
    alignItems: 'center',
    borderRadius: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 12,
    alignItems: 'center',
  },
  settingsRow: {
    borderWidth: 1,
    borderColor: '#BABABA',
    padding: 18,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  settingsText: {
    fontSize: 16,
    fontWeight: '500',
  },
});