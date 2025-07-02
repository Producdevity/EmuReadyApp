declare module 'react-native-send-intent' {
  interface SendIntentAndroid {
    openAppWithData(data: any, action: string, packageName: string): Promise<void>;
  }
  
  const SendIntentAndroid: SendIntentAndroid;
  export default SendIntentAndroid;
}