# Privacy Policy

**Effective Date**: January 3, 2025
**Last Updated**: January 3, 2025

---

## 1. Overview

Welcome to **FlowReader** (the "Extension"). We take your privacy seriously. This privacy policy explains how we collect, use, and protect your information.

**Important Note**: FlowReader is a **client-first** browser extension. We minimize data collection and processing as much as possible.

---

## 2. Information Collection

### 2.1 Information We Collect

#### Locally Stored Data

All data is stored locally in your browser (`chrome.storage.local`), and **is not uploaded to our servers**:

| Data Type                    | Content Stored                             | Storage Location     | Purpose                            |
| ---------------------------- | ------------------------------------------ | -------------------- | ---------------------------------- |
| **LLM Configuration**        | API keys, model names, providers           | chrome.storage.local | Connect to third-party AI services |
| **Vocabulary Configuration** | Vocabulary level, known/unknown word lists | chrome.storage.local | Personalized vocabulary filtering  |
| **Usage Status**             | First-time use, learning statistics        | chrome.storage.local | Improve product experience         |

#### Log Data

We **do not collect** the following data:

- ❌ URLs of websites you visit
- ❌ Text content you analyze
- ❌ Your learning records
- ❌ Personal information (name, email, IP address, etc.)

### 2.2 Information We Don't Collect

- **Personal Identity**: No account registration required, we don't collect names, emails, phone numbers
- **Usage Behavior**: We don't track which websites you visit or your click behavior
- **Location**: No geolocation data collected
- **Device Fingerprint**: No unique device identifiers generated

---

## 3. Data Usage

### 3.1 Use of Local Data

Data stored locally is **only used for extension functionality**:

| Data                         | Usage                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| **API Keys**                 | Sent to your configured LLM provider (OpenAI/Zhipu/Custom) to get AI analysis results |
| **Vocabulary Configuration** | Filters new words based on your vocabulary level, marks word mastery status           |
| **Learning Statistics**      | Display statistics in the extension interface (not shared)                            |

### 3.2 Use of Third-Party Services

This extension uses third-party AI services you configure (OpenAI, Zhipu AI, etc.):

**Data Sent**:

- The **text content** you select is sent to your configured LLM provider
- Content includes: text to be analyzed, system prompts

**Data Processing**:

- Third-party services return analysis results based on the content
- Analysis results are **only displayed locally in your browser**, **not saved by third parties**

**Third-Party Privacy Policies**:

- [OpenAI Privacy Policy](https://openai.com/policies/privacy-policy)
- [Zhipu AI Privacy Policy](https://bigmodel.cn/dev/aicenter#agreement)

---

## 4. Data Storage & Security

### 4.1 Data Storage Location

**All data is stored locally in your browser**:

- Storage location: `chrome.storage.local`
- Data scope: Only configuration and status data used by this extension
- Data isolation: Complete isolation between different users/computers

### 4.2 Data Security

We take the following measures to protect your data:

✅ **Local Encryption**: Browser's built-in encryption mechanism
✅ **Permission Control**: Only this extension can access stored data
✅ **No Network Transfer**: Data is not sent to our servers
✅ **User Control**: You can clear data at any time

### 4.3 Data Retention

| Data Type                | Retention Period  | Deletion Method                           |
| ------------------------ | ----------------- | ----------------------------------------- |
| LLM Configuration        | Permanent (local) | Uninstall extension or clear browser data |
| Vocabulary Configuration | Permanent (local) | Uninstall extension or clear browser data |
| Browser Cache            | Session only      | Automatically cleared when browser closes |

---

## 5. Third-Party Services

### 5.1 Third-Party Services Used

This extension uses the following third-party services:

| Service          | Provider        | Purpose                          | Data Processing                         |
| ---------------- | --------------- | -------------------------------- | --------------------------------------- |
| **OpenAI API**   | OpenAI          | Provide AI analysis capabilities | Text sent to their servers for analysis |
| **Zhipu AI API** | Zhipu AI        | Provide AI analysis capabilities | Text sent to their servers for analysis |
| **Custom API**   | User-configured | Provide AI analysis capabilities | Text sent to user-configured server     |

### 5.2 Third-Party Data Processing

**Important Notice**:

- We **do not control** third-party service data processing
- Your selected text will be sent to third-party servers
- Please review third-party service privacy policies

**Data Processing Flow**:

```
Your Browser → LLM API Provider → Return Analysis → Display in Extension
      ↑              ↑
      |              |
  Local Send    Third-Party Processing
```

---

## 6. Your Rights

### 6.1 Data Access

You can access data stored locally at any time:

1. Open Chrome extension management page
2. Find FlowReader
3. Click "Details"
4. View storage data under "Site permissions"

### 6.2 Data Deletion

You can delete all data at any time:

**Method 1**: Clear data in extension settings
**Method 2**: Uninstall extension (automatically clears all data)
**Method 3**: Clear browser data (chrome://settings/content)

### 6.3 Data Export

Current version does not support data export. Future versions will add:

- Export vocabulary configuration as JSON/CSV
- Backup learning records

---

## 7. Cookies & Tracking Technologies

### 7.1 Cookies

This extension **does not use cookies**.

### 7.2 Tracking Technologies

This extension **does not use** the following tracking technologies:

- ❌ Google Analytics
- ❌ Facebook Pixel
- ❌ Third-party tracking scripts
- ❌ Ad tracking

---

## 8. Children's Privacy

This extension is **not intended for children under 13**. We do not knowingly collect information from children under 13.

---

## 9. Policy Changes

We may update this privacy policy from time to time. For significant changes, we will:

1. Notify you within the extension
2. Update the "Last Updated" date in this document
3. Provide notice before releasing new versions

**Continued use of this extension indicates acceptance of the updated privacy policy.**

---

## 10. Contact Us

If you have any questions or suggestions about this privacy policy, please contact us:

- **Email**: [To be filled]
- **GitHub Issues**: [Project Repository](https://github.com/ChenChenyaqi/flow-reader/issues)
- **Chrome Web Store**: Leave a comment in the extension review section

---

## 11. Legal Notice

### 11.1 Governing Law

This privacy policy is governed by the laws of the People's Republic of China.

### 11.2 Dispute Resolution

Disputes arising from this privacy policy shall be resolved through friendly consultation. If consultation fails, either party may file a lawsuit with a people's court having jurisdiction at our location.

---

**Version**: v1.0.0
**Effective Date**: January 3, 2025
