/*import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from '@react-navigation/stack';
//import Chat from "./screens/Chat";
import Home from "./screens/Home";
//import Login from "./screens/Login";
const Stack = createStackNavigator();

function ChatStack(){
  return(
    <Stack.Navigator>
      <Stack.Screen name="Chat" component={Chat}/>
    </Stack.Navigator>
  )
}*/
/*
function HomeScreen(){
 return (
  <Stack.Navigator>
  <Stack.Screen name="Home" component={Home}/>
</Stack.Navigator>

  )
}

function RootNavigator(){//more navigation to here      // add <ChatStack/>
  return(
    <NavigationContainer>
      <HomeScreen/>
    </NavigationContainer>
  )
}


export default function App() {
  return <RootNavigator/>
}
*/

import * as React from 'react';
import { Button, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, TextInput, KeyboardAvoidingView,ScrollView, TouchableOpacity, Image, SafeAreaView, Alert} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import {useState} from 'react';
import SettingsList from 'react-native-settings-list';


function FrontHomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor:'#F7F3E7' }}>
      <Image
        style={{
          resizeMode: 'cover',
          height: 200,
          width: 500,
        }}
        source={require('./assets/HomePage.png')}
      />
      <Text style= {styles.BraceletStatus}>Bracelet Mode: (bracelet mode)</Text>
      <Text style= {styles.homeText}>Your last dose was taken at:</Text>
      <Text style= {styles.homeText}>Date:(date shown)</Text>
      <Text style= {styles.homeText}>Time:(time shown)</Text>
      <Text style= {styles.homeText}>Dosage:(last dosage shown)</Text>
      <View style={styles.buttonContainer}>
                <TouchableOpacity
                    //onPress= {signInWithEmailAndPassword}
                    onPress={()=>navigation.navigate('NewDose')}
                    style={styles.button}>
                    <Text style = {styles.buttonText}>Enter new dose</Text>
                </TouchableOpacity>
           </View>
    </View>
  );
}


// POST method: 
// http://server-url.com/api/dosage
// http://server-url.com is the base URL of the server.
// /api/dosage  is the endpoint that we want to access on the server.
// NEED TO: import moment from 'moment'; // Import moment library for date/time formatting
/*
const createButtonAlert = () => {
  const formattedDate = moment(date).format('YYYY-MM-DD');
  const formattedTime = moment(time).format('HH:mm:ss');
  const message = `Time: ${formattedTime}, Dosage: ${dosage}`;
  
  // construct the request payload
  const payload = {
    date: formattedDate,
    time: formattedTime,
    dosage: dosage
  };
  
  // send the POST request to the server
  fetch('http://server-url.com/api/dosage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    // if response is ok, navigate to FrontHome screen
    navigation.navigate('FrontHome');
  })
  .catch(error => {
    console.error('There was a problem with the POST request:', error);
  });
  
  Alert.alert('Action completed', message, [
    {
      text: 'Edit',
      onPress: () => console.log('Edit Pressed'),
      style: 'Edit',
    },
    {
      text: 'OK',
      onPress: () => {
        // navigate to FrontHome screen
        navigation.navigate('FrontHome');
      },
    },
  ]);
};
*/



 function NewDoseScreen({ navigation }) {
  const [dosage, setDosage] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatepicker, setShowDatepicker] = useState(false);
  const [showTimepicker, setShowTimepicker] = useState(false);

  const handleDatepicker = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatepicker(false);
    setDate(currentDate);
  };

  const handleTimepicker = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimepicker(false);
    setTime(currentTime);
  };
  const createButtonAlert = () => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    const formattedTime = moment(time).format('HH:mm:ss');
    const message = `Time: ${formattedTime}, Dosage: ${dosage}`;
    Alert.alert('Action completed', message, [
      {
        text: 'Edit',
        onPress: () => console.log('Edit Pressed'),
        style: 'Edit',
      },
      {
        text: 'OK',
        onPress: () => {
          // Call SQL function to save data here
          navigation.navigate('FrontHome');
        },
      },
    ]);
  };


  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' , backgroundColor:'#F7F3E7'}}>
      <Image
        style={{
          resizeMode : 'center',
          height: 200,
          width: 200,
          marginTop:100,
          transform: [{rotate: '135deg'}],
        }}
        source={require('./assets/another.png')}
      />
    <View style={styles.container}>
      <View style={styles.form}>
        <View style={styles.formField}>
          <Text style={styles.homeText}>Enter new dose:</Text>
          <TextInput
            style={styles.input}
            placeholder="Dosage"
            keyboardType="numeric"
            returnKeyType="done"
            value={dosage}
            onChangeText={(value) => setDosage(value)}
          />
        </View>
        <View style={styles.formField}>
          <TouchableOpacity onPress={() => setShowDatepicker(true)}>
            <Text style = {styles.homeText}>Date: {moment(date).format('DD/MM/YYYY')}</Text>
          </TouchableOpacity>
          {showDatepicker && (
             <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <DateTimePicker
              testID="datepicker"
              value={date}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={handleDatepicker}
            />
            </View>
          )}
        </View>
        <View style={styles.formField}>
          <TouchableOpacity onPress={() => setShowTimepicker(true)}>
            <Text style = {styles.homeText}>Time: {moment(time).format('hh:mm A')}</Text>
          </TouchableOpacity>
          {showTimepicker && (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <DateTimePicker
              testID="timepicker"
              value={time}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={handleTimepicker}

            />
           </View>
          )}
        </View>
      </View>
      <View>
        <TouchableOpacity style={styles.button} onPress={createButtonAlert}>
          <Text style={styles.buttonText}>Enter</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('FrontHome')}
            style={[styles.button, styles.buttonOutline]}>
            <Text style = {styles.buttonOutlineText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      </View>
  </View>
  );
}


function RecommendationsForDosageScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' , backgroundColor:'#F7F3E7'}}>
      <Text style={styles.recommendation}>
        Your new Recommendation is: 
      </Text>
    </View>
  );
}

function AllPrevDosesScreen({navigation}){
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor:'#F7F3E7' }}>
      <Text style={styles.homeText}>SHOW HERE ALL THE PREVIOUS DOSES TAKEN</Text>
    </View>
      );

}


function SettingsAndProfileScreen({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState(['', '', '']);

  const handleSubmit = () => {
    // TODO: implement form submission logic
  };

  const handleAddEmergencyContact = () => {
    if (emergencyContacts.length < 3) {
      setEmergencyContacts([...emergencyContacts, '']);
    }
  };

  const SaveChangesButtonAlert = () => {
    const message = 'Changes saved!';
    Alert.alert('Action completed', message, [
      {
        text: 'Edit',
        onPress: () => console.log('Edit Pressed'),
        style: 'Edit',
      },
      {
        text: 'OK',
        onPress: () => {
          // Call SQL function to save data here
          navigation.navigate('FrontHome');
        },
      },
    ]);
  };

  const handleRemoveEmergencyContact = (indexToRemove) => {
    setEmergencyContacts((contacts) =>
      contacts.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor:'#F7F3E7' }}>
      <Text style={styles.homeText}>Profile Details</Text>
      <TextInput
       style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        returnKeyType="done"
      />
      <TextInput
      style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        returnKeyType="done"
      />
      <TextInput
      style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        returnKeyType="done"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        returnKeyType="done"
        secureTextEntry
      />
      <Text style = {styles.homeText}>Emergency Contacts:</Text>
      {emergencyContacts.map((contact, index) => (
        <View key={index}>
          <TextInput
            style={styles.input}
            returnKeyType="done"
            placeholder={`Emergency Contact ${index + 1}`}
            value={contact}
            onChangeText={(value) => {
              setEmergencyContacts((contacts) => {
                const updatedContacts = [...contacts];
                updatedContacts[index] = value;
                return updatedContacts;
              });
            }}
          />
          {emergencyContacts.length > 1 && (
              <Button
                title="Remove"
                color={'#BC6665'}
                fontSize={12}
                onPress={() => handleRemoveEmergencyContact(index)}
              />

          )}
        </View>
      ))}
      {emergencyContacts.length < 3 && (
      <Button
        title="Add Emergency Contact"
        fontSize={12}
        onPress={handleAddEmergencyContact}
        color={'#438C9D'}
      />)}
      <TouchableOpacity style={styles.button} onPress={SaveChangesButtonAlert}>
          <Text style={styles.buttonText}>Save changes</Text>
        </TouchableOpacity>
    </View>
  );
}



function LogInAppScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor:'#F7F3E7' }}>
      <Image
        style={{
          resizeMode: 'cover',
          height: 200,
          width: 350,
        }}
        source={require('./assets/backImage.png')}
      />
      <Text style ={styles.title}>Login</Text>
       <TextInput
      style={styles.logInInput}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        returnKeyType="done"
      />
      <TextInput
        style={styles.logInInput}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        returnKeyType="done"
        secureTextEntry
      />
      <Button
        title="Forgot Password?"
        fontSize={10}
        //onPress={handleForgotPassword}
        color={'#438C9D'}
        onPress={()=>navigation.navigate('ForgotPassword')}
      />
      <View style={styles.buttonContainer}>
                <TouchableOpacity
                    //onPress= {signInWithEmailAndPassword}
                    onPress={()=>navigation.navigate('FrontHome')}
                    style={styles.button}>
                    <Text style = {styles.buttonText}>Login</Text>
                </TouchableOpacity>
      </View>
      <Text style={styles.homeText}>New to Stayble?</Text>
      <Button
        title="SignUp"
        fontSize={10}
        onPress={()=>navigation.navigate('SignUp')}
        color={'#438C9D'}
        //underline= {textDecorationLine= 'underline'} - NOT WORKING!!!
      />
    </View>
  );
}

function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor:'#F7F3E7' }}>
       <Image
        style={{
          resizeMode: 'cover',
          height: 320,
          width: 300,
        }}
        source={require('./assets/ForgotPassword.png')}
      />
      <Text style ={styles.title}>Forgot Password?</Text>
      <Text style= {styles.homeText}>Don't worry! it happenes.</Text>
      <Text style= {styles.homeText}>Please enter the email address associated with your account.{'\n'} </Text>
 
      <TextInput
      style={styles.logInInput}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        returnKeyType="done"
      />
       <View style={styles.buttonContainer}>
                <TouchableOpacity
                    //onPress= {signInWithEmailAndPassword}
                    onPress={()=>navigation.navigate('LogInApp')}
                    style={styles.button}>
                    <Text style = {styles.buttonText}>Submit</Text>
                </TouchableOpacity>
      </View>
    </View>

  );
}

function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState(['', '', '']);

  const handleSubmit = () => {
    // TODO: implement form submission logic
  };

  const handleAddEmergencyContact = () => {
    if (emergencyContacts.length < 3) {
      setEmergencyContacts([...emergencyContacts, '']);
    }
  };

  const SaveChangesButtonAlert = () => {
    const message = 'Changes saved!';
    Alert.alert('Action completed', message, [
      {
        text: 'Edit',
        onPress: () => console.log('Edit Pressed'),
        style: 'Edit',
      },
      {
        text: 'OK',
        onPress: () => {
          // Call SQL function to save data here
          navigation.navigate('FrontHome');
        },
      },
    ]);
  };

  const handleRemoveEmergencyContact = (indexToRemove) => {
    setEmergencyContacts((contacts) =>
      contacts.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor:'#F7F3E7' }}>
      <ScrollView>
       <Image
        style={{
          resizeMode: 'contain',
          height: 300,
          width: 300,
        }}
        source={require('./assets/signup.png')}
      />
      <Text style={styles.title}>SignUp</Text>
      <TextInput
       style={styles.signUpInput}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        returnKeyType="done"
        alignItems={'center'}
        justifyContent={'center'}
      />
      <TextInput
      style={styles.signUpInput}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        returnKeyType="done"
      />
      <TextInput
      style={styles.signUpInput}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        returnKeyType="done"
      />
      <TextInput
        style={styles.signUpInput}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        returnKeyType="done"
        secureTextEntry
      />
      <Text style = {styles.homeText}>Emergency Contacts:</Text>
      {emergencyContacts.map((contact, index) => (
        <View key={index}>
          <TextInput
            style={styles.signUpInput}
            returnKeyType="done"
            placeholder={`Emergency Contact ${index + 1}`}
            value={contact}
            onChangeText={(value) => {
              setEmergencyContacts((contacts) => {
                const updatedContacts = [...contacts];
                updatedContacts[index] = value;
                return updatedContacts;
              });
            }}
          />
          {emergencyContacts.length > 1 && (
              <Button
                title="Remove"
                color={'#BC6665'}
                fontSize={12}
                onPress={() => handleRemoveEmergencyContact(index)}
              />

          )}
        </View>
      ))}
      {emergencyContacts.length < 3 && (
      <Button
        title="Add Emergency Contact"
        fontSize={12}
        onPress={handleAddEmergencyContact}
        color={'#438C9D'}
      />)}
      <TouchableOpacity style={styles.saveButton} onPress={SaveChangesButtonAlert}>
          <Text style={styles.buttonText}>Save changes</Text>
        </TouchableOpacity>
        </ScrollView>
    </View>
  );
}



const Tab = createBottomTabNavigator();
const SettingsStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer >
      <Tab.Navigator  
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#438C9D',
          }}
          >
                  <Tab.Screen name="Home" options={{ tabBarActiveTintColor: '#438C9D' }}>
          {() => (
            <SettingsStack.Navigator>
              <SettingsStack.Screen name="FrontHome"component={FrontHomeScreen} options={{ headerShown: false }} />
              <SettingsStack.Screen name="NewDose" component={NewDoseScreen} options={{ headerShown: false }} />
            </SettingsStack.Navigator>
          )}
        </Tab.Screen>

          <Tab.Screen name="Recomendations" options={{ tabBarActiveTintColor: '#438C9D' }}>
          {() => (
            <SettingsStack.Navigator>
              <SettingsStack.Screen name="RecommendationsForDosage"component={RecommendationsForDosageScreen} options={{ headerShown: false }} />
              <SettingsStack.Screen name="NewDose" component={NewDoseScreen} options={{ headerShown: false }} />
            </SettingsStack.Navigator>
          )}
        </Tab.Screen>
   
        <Tab.Screen name="Settings"options={{ tabBarActiveTintColor: '#438C9D' }}>
          {() => (
            <HomeStack.Navigator>
              <HomeStack.Screen name="SettingsAndProfile" component={SettingsAndProfileScreen} options={{ headerShown: false }}/>
            </HomeStack.Navigator>
          )}
        </Tab.Screen>
        <Tab.Screen name="History"options={{ tabBarActiveTintColor: '#438C9D' }}>
          {() => (
            <HomeStack.Navigator>
              <HomeStack.Screen name="AllPrevDoses" component={AllPrevDosesScreen} options={{ headerShown: false }}/>
            </HomeStack.Navigator>
          )}
        </Tab.Screen>

        <Tab.Screen name="Login"options={{ tabBarActiveTintColor: '#438C9D' }}>
          {() => (
            <HomeStack.Navigator>
              <HomeStack.Screen name="LogInApp" component={LogInAppScreen} options={{ headerShown: false }}/>
              <HomeStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }}/>
              <HomeStack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }}/>
            </HomeStack.Navigator>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}



const styles = StyleSheet.create({
  BraceletStatus:{
    paddingHorizontal: 15,
    paddingVertical:10,
    borderRadius:10,
    marginTop:5,
    textAlign: 'center',
    borderColor: '#438C9D',
    borderWidth: 2,
    backgroundColor:'white',
  },
  title:{
    fontSize: 26, 
    marginTop:20,
    marginBottom:20,
    paddingHorizontal: 15,
    paddingVertical:5,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  homeText:{
    fontSize: 16, 
    marginTop:20,
    paddingHorizontal: 15,
    paddingVertical:5,
    textAlign: 'center',
  },
  container:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:'#F7F3E7',
    marginBottom:100,
  },
inputContainer:{
  width:'80%',
},
input:{
  width: 150, // set a fixed width
  height: 50, // set a fixed height
  backgroundColor:'white',
  borderRadius:10,
  marginTop:5,
  textAlign: 'center',
},
logInInput:{
  width: 250, // set a fixed width
  height: 40, // set a fixed height
  backgroundColor:'white',
  borderRadius:10,
  marginTop:5,
  textAlign: 'center',
},
signUpInput: {
  height: 40,
  backgroundColor:'white',
  borderRadius: 10,
  padding: 10,
  margin: 5,
  textAlign: 'center',
},
buttonContainer:{
  justifyContent:'center',
  alignItems:'center', 
  marginTop:40,
},
button: {
  backgroundColor: '#438C9D',
  width: 150, // set a fixed width
  height: 50, // set a fixed height
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
  marginTop:20,
},
buttonOutline: {
  backgroundColor: 'white',
  borderColor: '#438C9D',
  borderWidth: 2,
  width: 150, // set a fixed width
  height: 50, // set a fixed height
  borderRadius: 10,
  alignItems: 'center',
  justifyContent: 'center',
},
buttonText:{
  color: 'white', 
  fontSize: 16, 
  fontWeight: '700' ,
  textAlign: 'center',
},
buttonOutlineText:{
  color:'#438C9D',
  fontSize: 16, 
  fontWeight:'700',
  textAlign: 'center',
},
saveButton: {
  backgroundColor: '#438C9D',
  padding: 10,
  borderRadius: 10,
  margin: 10,
  alignSelf: 'center',
},
inputData:{ 
  backgroundColor: 'white',
  width: '50%', 
  paddingHorizontal: 15, 
  paddingVertical: 10, 
  borderRadius: 10, 
  marginTop: 5 
},
recommendation:{
  backgroundColor:'white',
  paddingHorizontal: 20,
  paddingVertical:20,
  borderRadius:20,
  marginTop:20,
  borderRadius:10,
  justifyContent:'center',
  alignItems:'center', 
  width:'80%',
},
header: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 30,
  borderBottomColor: 'black',
  borderBottomWidth: 2,
},

})