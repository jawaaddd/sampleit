import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

interface FileUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  visible,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentResult | null>(null);
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result);
        console.log('Selected file:', result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const uploadFile = async () => {
    if (!selectedFile || selectedFile.canceled || !selectedFile.assets) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    setUploading(true);

    try {
      const file = selectedFile.assets[0];
      console.log('File details:', {
        name: file.name,
        uri: file.uri,
        mimeType: file.mimeType,
        size: file.size
      });
      
      // Create FormData
      const formData = new FormData();
      
      // Add the file - try different approaches for React Native
      try {
        // Method 1: Standard React Native approach
        formData.append('sampleFile', {
          uri: file.uri,
          type: file.mimeType || 'audio/mpeg',
          name: file.name,
        } as any);
        console.log('File added to FormData using standard approach');
      } catch (formDataError) {
        console.error('Error adding file to FormData:', formDataError);
        
        // Method 2: Try reading file as base64 and creating a blob
        try {
          console.log('Trying alternative file upload method...');
          const fileInfo = await FileSystem.getInfoAsync(file.uri);
          console.log('File info:', fileInfo);
          
          if (fileInfo.exists) {
            const base64 = await FileSystem.readAsStringAsync(file.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            
            // Create a blob-like object
            const blob = {
              uri: `data:${file.mimeType || 'audio/mpeg'};base64,${base64}`,
              type: file.mimeType || 'audio/mpeg',
              name: file.name,
            };
            
            formData.append('sampleFile', blob as any);
            console.log('File added to FormData using base64 approach');
          } else {
            throw new Error('File does not exist');
          }
        } catch (base64Error) {
          console.error('Base64 approach also failed:', base64Error);
          throw new Error('Failed to prepare file for upload');
        }
      }

      // Add tags
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      formData.append('tags', JSON.stringify(tagsArray));

      console.log('FormData created with:', {
        fileName: file.name,
        fileType: file.mimeType || 'audio/mpeg',
        tags: tagsArray
      });

      // Upload to backend - try different URLs
      const urls = [
        'http://localhost:8000/samples/',
        'http://10.0.0.60:8000/samples/',
        'http://172.20.208.1:8000/samples/'
      ];

      let response;
      let lastError;

      for (const url of urls) {
        try {
          console.log(`Trying upload to: ${url}`);
          
          response = await fetch(url, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header - let fetch set it automatically for FormData
          });

          console.log(`Response from ${url}:`, {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          });

          if (response.ok) {
            break; // Success, exit the loop
          } else {
            const errorText = await response.text();
            console.error(`Upload failed to ${url}:`, response.status, errorText);
            lastError = { status: response.status, text: errorText, url };
          }
        } catch (fetchError) {
          console.error(`Network error for ${url}:`, fetchError);
          lastError = { error: fetchError, url };
        }
      }

      if (response && response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        Alert.alert('Success', 'File uploaded successfully!');
        
        // Reset form
        setSelectedFile(null);
        setTags('');
        
        // Close modal and refresh samples
        onClose();
        onUploadSuccess();
      } else {
        console.error('All upload attempts failed. Last error:', lastError);
        const errorMessage = lastError?.text || lastError?.error?.message || 'Unknown error';
        Alert.alert('Upload Failed', `Error: ${lastError?.status || 'Network'} - ${errorMessage}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Error', `Failed to upload file: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const testUpload = async () => {
    console.log('Testing upload with minimal data...');
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('tags', JSON.stringify(['test']));
      
      const response = await fetch('http://localhost:8000/samples/', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Test upload response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Test upload successful:', result);
        Alert.alert('Test Success', 'Backend is accessible for uploads');
      } else {
        const errorText = await response.text();
        console.error('Test upload failed:', response.status, errorText);
        Alert.alert('Test Failed', `Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Test upload error:', error);
      Alert.alert('Test Error', `Network error: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setTags('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Upload MP3 Sample</Text>
          </View>

          <View style={styles.uploadSection}>
            <TouchableOpacity
              style={styles.filePickerButton}
              onPress={pickDocument}
              disabled={uploading}
            >
              <Text style={styles.filePickerText}>
                {selectedFile && !selectedFile.canceled && selectedFile.assets
                  ? selectedFile.assets[0].name
                  : 'Select MP3 File'}
              </Text>
            </TouchableOpacity>

            <View style={styles.tagsSection}>
              <Text style={styles.tagsLabel}>Tags (comma-separated):</Text>
              <TextInput
                style={styles.tagsInput}
                value={tags}
                onChangeText={setTags}
                placeholder="e.g., indie, ambient pop, electronic"
                placeholderTextColor="#666"
                multiline={false}
                editable={!uploading}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleClose}
                disabled={uploading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.uploadButton, uploading && styles.disabledButton]}
                onPress={uploadFile}
                disabled={uploading || !selectedFile || selectedFile.canceled}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.uploadButtonText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, styles.testButton]}
              onPress={testUpload}
              disabled={uploading}
            >
              <Text style={styles.testButtonText}>Test Backend Connection</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  uploadSection: {
    gap: 20,
  },
  filePickerButton: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
    borderWidth: 2,
    borderColor: '#555',
    borderStyle: 'dashed',
  },
  filePickerText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  tagsSection: {
    gap: 8,
  },
  tagsLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  tagsInput: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#555',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#444',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: '#9b59b6',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  testButton: {
    backgroundColor: '#3498db',
    marginTop: 10,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FileUploadModal;
