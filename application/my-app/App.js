import * as React from 'react';
import { Button, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, TextInput, KeyboardAvoidingView,ScrollView, TouchableOpacity, Image, SafeAreaView, Alert} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import  { useState, useEffect } from 'react';
import SettingsList from 'react-native-settings-list';
import { createStackNavigator } from '@react-navigation/stack'
import {GiftedChat} from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons'; 
import Video from 'react-native-video';
        /*<TouchableOpacity onPress={() => setVideoUrl(require("'./assets/symptoms.mp4'"))} style={styles.button}>
          <Text style={styles.buttonText}>Info</Text>
        </TouchableOpacity>*/


// ************************************************************Home sceen*********************************************************
//GET method:
function FrontHomeScreen({ navigation }) {
  const [lastDose, setLastDose] = useState({ date: '', time: '', dosage: '' });
  payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({id: global.user_id})
  };
  console.log(`id: ${global.user_id}`);
  useEffect(() => {
    // Call GET request to the server to get the last dose
    fetch('http://192.168.237.209:3306/last_dose', payload)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      // Call GET request to the server to get the last dose
      //return fetch('http://192.168.237.209:3306//last_dose', payload);
    })
    .then((data) => {
      // Update the state with the last dose
      if(data.answer == 1){
        setLastDose({
          date: data.result.date,
          time: data.result.time,
          dosage: data.result.dosage,
        });
      }
      else{
        setLastDose({
          date: 'No data',
          time: 'No data',
          dosage: 'No data',
        });
      }
    })
    .catch((error) => {
      console.log(error);
    });
  }, []);
  return(
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
      <Text style= {styles.homeText}>
        <Ionicons name="medkit-outline" size={24} color="black" />
        (last dose in mg)
      </Text>
      <Text style= {styles.homeText}>
        <Ionicons name="calendar-outline" size={24} color="black" />
        (date shown)
      </Text>
      <Text style= {styles.homeText}>
        <Ionicons name="time-outline" size={24} color="black" />
       (time shown)
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('NewDose')}
          style={styles.button}>
          <Text style={styles.buttonText}>Enter new dose</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


/*
function FrontHomeScreen({ navigation }) {
  const [videoUrl, setVideoUrl] = useState('');

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
      <Text style= {styles.homeText}>
        <Ionicons name="medkit-outline" size={24} color="black" />
        (last dose in mg)
      </Text>
      <Text style= {styles.homeText}>
        <Ionicons name="calendar-outline" size={24} color="black" />
        (date shown)
      </Text>
      <Text style= {styles.homeText}>
        <Ionicons name="time-outline" size={24} color="black" />
       (time shown)
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('NewDose')}
          style={styles.button}>
          <Text style={styles.buttonText}>Enter new dose</Text>
        </TouchableOpacity>
        

        
      </View>

      {videoUrl && (
        <Video source={{ uri: videoUrl }} style={{ width: 300, height: 200 }} />
      )}
    </View>
  );
}
*/
// ************************************************************New Dose sceen*********************************************************
// POST method: 
// http://server-url.com/api/dosage
// http://server-url.com is the base URL of the server.
// /api/dosage  is the endpoint that we want to access on the server.
// NEED TO: import moment from 'moment'; // Import moment library for date/time formatting

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
    const formattedDate = moment(date).format('DD-MM-YYYY');
    const formattedTime = moment(time).format('HH:mm');
    const message = `Time: ${formattedTime}, Dosage: ${dosage}`;
    const empty_message ='';
    // construct the request payload
    const payload = {
      id: global.user_id,
      date: formattedDate,
      time: formattedTime,
      dosage: dosage
    };
    
    // send the POST request to the server
    fetch('http://172.20.10.5:3306/dose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(response => {
      if (!response.ok) {
        Alert.alert('There is a problem, please try again.', empty_message, [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('NewDose'); // nstay at this current screen
            },
          },
        ]);
        throw new Error('Network response was not ok');
      }
      else
      {
        Alert.alert('Action completed', message, [
          {
            text: 'Edit',
            onPress: () => console.log('Edit Pressed'),
            style: 'Edit',
          },
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('FrontHome'); // navigate to FrontHome screen
            },
          },
        ]);
      }
      // if response is ok, navigate to FrontHome screen
      navigation.navigate('FrontHome');
    })
    .catch(error => {
      console.error('There was a problem with the POST request:', error);
    });
    

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
            placeholder="Dosage in mg"
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
            <Text style = {styles.homeText}>Time: {moment(time).format('HH:mm')}</Text>
          </TouchableOpacity>
          {showTimepicker && (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <DateTimePicker
              testID="timepicker"
              value={time}
              mode="time"
              is24Hour={true}
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

// *********************************************************************************************************************
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
  const [madison_name, setMadison] = useState('');
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
          // Call SQL function to save data here??
          navigation.navigate('LogInApp');
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
          width: 350,
          marginTop: 30 
        }}
        source={require('./assets/profile.png')}
      />
      <Text style={[styles.title, { marginTop: -30 }]}>Profile</Text>
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
        placeholder="Madison name"
        value={madison_name}
        onChangeText={setMadison}
        keyboardType="email-address"
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
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
        </ScrollView>
    </View>
  );
}



// ************************************************************Login sceen*********************************************************

//this is in http request

function LogInAppScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  
  const handleLogin = () => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    };

    fetch('http://192.168.237.209:3306/login', requestOptions)
      .then(response => response.json())
      .then(data => {
        if (data['answer'] === 1) {
          global.user_id = data['user']['id']
          navigation.navigate(Home, { email, password });
        } else {
          console.log("User does not exist");
          alert('User does not exist');
        }
        console.log(data);
      })
      .catch(error => console.error(error));
  };

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
                    onPress= {handleLogin}
                    //onPress={()=>navigation.navigate('FrontHome')}
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

//this is working without the server
/*
function LogInAppScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
 

  const handleLogin = () => {
    if (email === 'user@example.com' && password === 'password') {
      //setIsLoggedIn(true);
      navigation.navigate(Home, { email, password });
    } else {
      Alert.alert('Invalid credentials', 'Please try again');
    }
  };
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
                    onPress= {handleLogin}
                    //onPress={()=>navigation.navigate('FrontHome')}
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
*/
// ************************************************************Forgot password sceen*********************************************************
//in http
/*
function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    const payload = {
      email: email,
    };
    try {
      const response = await fetch('http://192.168.237.209:3306/reset_password', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      console.log(data);
      navigation.navigate('ResetPassword', { email });
    } catch (error) {
      console.error(error);
    }
  };

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
      <TextInput
        style={styles.logInInput}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        returnKeyType="done"
      />
      <Text style= {styles.homeText}>Don't worry! it happens.</Text>
      <Text style= {styles.homeText}>Please enter the email address associated with your account.{'\n'} </Text>

      
       <View style={styles.buttonContainer}>
         <TouchableOpacity onPress={handleResetPassword} style={styles.button}>
           <Text style={styles.buttonText}>Submit</Text>
         </TouchableOpacity>
       </View>
    </View>
  );
}
*/

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
      <TextInput
      style={styles.logInInput}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        returnKeyType="done"
      />
      <Text style= {styles.homeText}>Don't worry! it happenes.</Text>
      <Text style= {styles.homeText}>Please enter the email address associated with your account.{'\n'} </Text>
 

       <View style={styles.buttonContainer}>
                <TouchableOpacity
                    //onPress= {signInWithEmailAndPassword}
                    onPress={()=>navigation.navigate('ResetPassword', { email })}
                    style={styles.button}>
                    <Text style = {styles.buttonText}>Submit</Text>
                </TouchableOpacity>
      </View>
    </View>

  );
}

// ************************************************************Reset Password sceen*********************************************************

  /*this is not http
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
          navigation.navigate('LogInApp');
        },
      },
    ]);
  };*/

function ResetPasswordScreen({ navigation }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const route = useRoute();
  const email = route.params.email;
  
  const SaveChangesButtonAlert = () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in both password fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const payload = {
      email: email,
      password: password,
    };

    const response = fetch('http://192.168.237.209:3306/reset_password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      navigation.navigate('FrontHome');
    } else {
      // handle error case here
    }
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor:'#F7F3E7' }}>
      <Image
        style={{
          resizeMode: 'cover',
          height: 320,
          width: 300,
        }}
        source={require('./assets/forgotPasswordImage.png')}
      />
      <Text style ={styles.title}>Reset Password</Text>
 
      <TextInput
        style={styles.logInInput}
        placeholder="New password"
        value={password}
        onChangeText={setPassword}
        returnKeyType="done"
        secureTextEntry
        required={true}
      />
      <TextInput
        style={styles.logInInput}
        placeholder="Confirm new password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        returnKeyType="done"
        secureTextEntry
        required={true}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={SaveChangesButtonAlert}>
          <Text style={styles.buttonText}>Save changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
/*
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
      onPress: async () => {
        const requestBody = {
          name,
          age,
          email,
          password,
          emergencyContacts,
        };
    const payload = {
      password: password,
    };
        const response = await fetch('http://server-url.com/api/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          navigation.navigate('FrontHome');
        } else {
          // handle error case here
        }
      },
    },
  ]);
  
};
*/


// ************************************************************Signup sceen************************************************
//in http request POST
/*
function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [madison_name, setMadison] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

     const payload = {
      id: global.user_id,
      name: name,
      age: age,
      madison_name: madison_name
      email: email,
      password: password,
    };

  const handleSubmit = () => {
    const data = {
      name,
      age,
      madison_name,
      email,
      password,
      /////emergency_contacts: emergencyContacts
    };

    axios.post('https://example.com/signup', data)
      .then(response => {
        console.log('Success:', response.data);
        navigation.navigate('LogInApp');
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor:'#F7F3E7' }}>
      <ScrollView>
       <Image
        style={{
          resizeMode: 'contain',
          height: 350,
          width: 350,
        }}
        source={require('./assets/signup.png')}
      />
      <Text style={[styles.title, { marginTop: -70 }]}>SignUp</Text>
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
        placeholder="Madison name"
        value={madison_name}
        onChangeText={setMadison}
        keyboardType="email-address"
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

      <TouchableOpacity style={styles.saveButton} onPress={NextButtonAlert}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
        </ScrollView>
    </View>
  );
}
*/
function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [madison_name, setMadison] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const handleSubmit = () => {
    // TODO: implement form submission logic
  };

  const NextButtonAlert = () => {
    const message =" ";
    Alert.alert('You are half way there!',message, [
      {
        text: 'Edit',
        onPress: () => console.log('Edit Pressed'),
        style: 'Edit',
      },
      {
        text: 'OK',
        onPress: () => {
          // Call SQL function to save data here??
          navigation.navigate('EmrContacts');
        },
      },
    ]
  );
  };


  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor:'#F7F3E7' }}>
      <ScrollView>
       <Image
        style={{
          resizeMode: 'contain',
          height: 350,
          width: 350,
        }}
        source={require('./assets/signup.png')}
      />
      <Text style={[styles.title, { marginTop: -70 }]}>SignUp</Text>
      <TextInput
       style={styles.signUpInput}
        placeholder="Name"
        value={name}
        onChangeText={setName}
        returnKeyType="done"
        alignItems={'center'}
        justifyContent={'center'}
        required={true}
      />
      <TextInput
      style={styles.signUpInput}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        returnKeyType="done"
        required={true}
      />
      <TextInput
      style={styles.signUpInput}
        placeholder="Madison name"
        value={madison_name}
        onChangeText={setMadison}
        keyboardType="email-address"
        returnKeyType="done"
        required={true}
      />
      <TextInput
      style={styles.signUpInput}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        returnKeyType="done"
        required={true}
      />
      <TextInput
        style={styles.signUpInput}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        returnKeyType="done"
        secureTextEntry
        required={true}
      />

      <TouchableOpacity style={styles.saveButton} onPress={NextButtonAlert}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
        </ScrollView>
    </View>
  );
}






//in http request POST
function EmrContactsScreen({ navigation }) {
  const [emergencyContacts, setEmergencyContacts] = useState(['']);

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
        onPress: async () => {
          try {
            const responseMac = await fetch('https://io.adafruit.com/api/v2/matanbakva/feeds/', {
              headers: {
                'X-AIO-Key': 'aio_OgzQ40DJCO3WVskhYoiwi1imzQMK',
                'Content-Type': 'application/json'
              }
            });
            if (responseMac.ok) {
              const response = await fetch('http://192.168.237.209:3306/new/contact', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contacts: emergencyContacts }),
              });
              if (response.ok) {
                navigation.navigate('LogInApp');
              }
            }
          } catch (error) {
            console.log(error);
          }
        }
    }])
    }
  const handleAddEmergencyContact = () => {
    if (emergencyContacts.length < 3) {
      setEmergencyContacts([...emergencyContacts, '']);
    }
  };

  const handleRemoveEmergencyContact = (indexToRemove) => {
    setEmergencyContacts((contacts) =>
      contacts.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor:'#F7F3E7' }}>
      <Text style={styles.title}>Emergency Contacts:</Text>
      <Text style={styles.homeText}>
        If we detect that you have fallen,{'\n'} we will notify the people you specify on this {'\n'}screen by sending them an email.{'\n\n'} You can enter the email addresses of up to three individuals.
      </Text>
      {emergencyContacts.map((contact, index) => (
        <View key={index}>
          <TextInput
              width = {300}
              height = {40}
            style={styles.signUpInput}
            returnKeyType="done"
            placeholder={`Emergency Contact ${index + 1} Email Address`}
            value={contact}
            alignItems={'center'}
            justifyContent={'center'}
            onChangeText={(value) => {
            setEmergencyContacts((contacts) => {
                const updatedContacts = [...contacts];
                updatedContacts[index] = value;
                return updatedContacts;
              });
            }}
            required={index === 0}
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
        />
      )}
      <TouchableOpacity style={styles.saveButton} onPress={SaveChangesButtonAlert}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}



//not in http request 
/*
function EmrContactsScreen({ navigation }) {
  const [emergencyContacts, setEmergencyContacts] = useState(['', '', '']);

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
          // Call SQL function to save data here??
          navigation.navigate('LogInApp');
        },
      },
    ]);
  };

  
  const handleAddEmergencyContact = () => {
    if (emergencyContacts.length < 3) {
      setEmergencyContacts([...emergencyContacts, '']);
    }
  };

  const handleRemoveEmergencyContact = (indexToRemove) => {
    setEmergencyContacts((contacts) =>
      contacts.filter((_, index) => index !== indexToRemove)
    );
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor:'#F7F3E7' }}>
      <Text style = {styles.title}>Emergency Contacts:</Text>
      <Text style={styles.homeText}>
      If we detect that you have fallen,{'\n'} we will notify the people you specify on this {'\n'}screen by sending them an email.{'\n'}{'\n'} You can enter the email addresses of up to three individuals.
      </Text>
    {
      emergencyContacts.map((contact, index) => (
      <View key={index}>
        <TextInput
          style={styles.signUpInput}
          returnKeyType="done"
          placeholder={`Emergency Contact ${index + 1} Email Address`}
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
      <Text style={styles.buttonText}>Submit</Text>
    </TouchableOpacity>
  </View>
  );
}
*/



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const Auth = () => {
  return (
    <Stack.Navigator initialRouteName="LogInApp">
      <Stack.Screen name="LogInApp" component={LogInAppScreen} options={{headerShown: false}} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{headerShown: false}} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{headerShown: false}} />
      <Stack.Screen name="SignUp" component={SignUpScreen} options={{headerShown: false}} />
      <Stack.Screen name="EmrContacts" component={EmrContactsScreen} options={{headerShown: false}} />
    </Stack.Navigator>
  );
};

const Home = () => {
  return ( 
    <Tab.Navigator
      tabBarOptions={{
        activeTintColor: '#438C9D',
        inactiveTintColor: 'gray',
      }}>
      <Tab.Screen
        name="Home"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={30} color={color} />
          ),
        }}
      >
        {() => (
          <Stack.Navigator>
            <Stack.Screen name="FrontHome" component={FrontHomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="NewDose" component={NewDoseScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="History"
        component={AllPrevDosesScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={30} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Recommendations"
        component={RecommendationsForDosageScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={30} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SettingsAndProfileScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={30} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator>
          <Stack.Screen name="Auth" component={Auth} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;



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
    marginBottom:20,
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
  width: 150, // set a fixed width
  height: 50, // set a fixed height
  marginTop:20,
 alignItems: 'center',
 textAlign: 'center',
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