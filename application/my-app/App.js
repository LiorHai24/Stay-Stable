import * as React from "react";
import { Button, View, Text, Dimensions, Modal } from "react-native";
import {
	NavigationContainer,
	useIsFocused,
	useRoute,
	useFocusEffect,
} from "@react-navigation/native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
	StyleSheet,
	TextInput,
	KeyboardAvoidingView,
	ScrollView,
	TouchableOpacity,
	Image,
	SafeAreaView,
	Alert,
} from "react-native";
import {
	LineChart,
	BarChart,
	PieChart,
	ProgressChart,
	ContributionGraph,
	StackedBarChart,
} from "react-native-chart-kit";
import { Calendar, LocaleConfig } from "react-native-calendars";

import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import { useState, useEffect } from "react";
import SettingsList from "react-native-settings-list";
import { createStackNavigator } from "@react-navigation/stack";
import { GiftedChat } from "react-native-gifted-chat";
import { Ionicons } from "@expo/vector-icons";
import Video from "react-native-video";

/*<TouchableOpacity onPress={() => setVideoUrl(require("'./assets/symptoms.mp4'"))} style={styles.button}>
          <Text style={styles.buttonText}>Info</Text>
        </TouchableOpacity>*/

// ************************************************************Home sceen*********************************************************

//server ip : 34.233.185.82

//GET method:
function FrontHomeScreen({ navigation }) {
	const [lastDose, setLastDose] = useState({
		date: "",
		time: "",
		dosage: "",
		status: "",
	});

	useFocusEffect(
		React.useCallback(() => {
			const payload = {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: global.user_id }),
			};

			// Call GET request to the server to get the last dose
			fetch("http://34.233.185.82:3306/last_dose", payload)
				.then((response) => {
					if (!response.ok) {
						throw new Error("Network response was not ok");
					}
					return response.json(); // parse response body as JSON
				})
				.then((data) => {
					console.log(data); // log the response body
					global.date = data.result.date;
					global.time = data.result.time;
					global.dosage = data.result.dosage;
					payload.body = JSON.stringify({ id: global.user_id });

					fetch("http://34.233.185.82:3306/check_connection", payload)
						.then((response) => {
							if (!response.ok) {
								throw new Error("Network response was not ok");
							}
							return response.json(); // parse response body as JSON
						})
						.then((data1) => {
							console.log(data1["status"]);
							let status1 = data1["status"] === 1 ? "connected" : "not connect";
							if (data["answer"] === 1) {
								setLastDose({
									status: status1,
									date: global.date,
									time: global.time,
									dosage: ` ${global.dosage}mg`,
								});
							} else {
								setLastDose({
									date: " No data",
									time: " No data",
									dosage: " No data",
								});
							}
						});
				})
				.catch((error) => {
					console.log(error);
				});
		}, [])
	);

	while (lastDose.dosage === undefined) {}
	console.log(lastDose.dosage);
	return (
		<View
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#F7F3E7",
			}}
		>
			<Image
				style={{
					resizeMode: "cover",
					height: 200,
					width: 500,
				}}
				source={require("./assets/HomePage.png")}
			/>
			<Text style={styles.BraceletStatus}>
				Bracelet Status: {lastDose.status}
			</Text>
			<Text style={styles.homeText}>
				<Ionicons name="medkit-outline" size={24} color="black" />
					{lastDose.dosage}
			</Text>
			<Text style={styles.homeText}>
				<Ionicons name="calendar-outline" size={24} color="black" />
					{lastDose.date}
			</Text>
			<Text style={styles.homeText}>
				<Ionicons name="time-outline" size={24} color="black" />
				{	lastDose.time}
			</Text>

			<View style={styles.buttonContainer}>
				<TouchableOpacity
					onPress={() => navigation.navigate("NewDose")}
					style={styles.button}
				>
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
	const [dosage, setDosage] = useState("");
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
		const formattedDate = moment(date).format("DD-MM-YYYY");
		const formattedTime = moment(time).format("HH:mm");
		const message = `Time: ${formattedTime}, Dosage: ${dosage}`;
		const empty_message = "";
		// construct the request payload
		const payload = {
			id: global.user_id,
			date: formattedDate,
			time: formattedTime,
			dosage: dosage,
		};
		console.log(payload);

		// send the POST request to the server
		fetch("http://34.233.185.82:3306/dose", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then((response) => {
				if (!response.ok) {
					Alert.alert("There is a problem, please try again.", empty_message, [
						{
							text: "OK",
							onPress: () => {
								navigation.navigate("NewDose"); // nstay at this current screen
							},
						},
					]);
					throw new Error("Network response was not ok");
				} else {
					Alert.alert("Action completed", message, [
						{
							text: "Edit",
							onPress: () => console.log("Edit Pressed"),
							style: "Edit",
						},
						{
							text: "OK",
							onPress: () => {
								navigation.navigate("FrontHome"); // navigate to FrontHome screen
							},
						},
					]);
				}
				// if response is ok, navigate to FrontHome screen
				navigation.navigate("FrontHome");
			})
			.catch((error) => {
				console.error("There was a problem with the POST request:", error);
			});
	};

	return (
		<View
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#F7F3E7",
			}}
		>
			<Image
				style={{
					resizeMode: "center",
					height: 200,
					width: 200,
					marginTop: 100,
					transform: [{ rotate: "135deg" }],
				}}
				source={require("./assets/another.png")}
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
							<Text style={styles.homeText}>
								Date: {moment(date).format("DD/MM/YYYY")}
							</Text>
						</TouchableOpacity>
						{showDatepicker && (
							<View style={{ justifyContent: "center", alignItems: "center" }}>
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
							<Text style={styles.homeText}>
								Time: {moment(time).format("HH:mm")}
							</Text>
						</TouchableOpacity>
						{showTimepicker && (
							<View style={{ justifyContent: "center", alignItems: "center" }}>
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
						onPress={() => navigation.navigate("FrontHome")}
						style={[styles.button, styles.buttonOutline]}
					>
						<Text style={styles.buttonOutlineText}>Cancel</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
}

// *********************************************************************************************************************
function AnalyticsScreen({ navigation }) {
	//1st graph
	//this gragh is for doses taken in each day
	//the x in the graph (labels) are the last 7 days
	// the y is for dosage each time
	const currentDate = new Date();
	const lastMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());
	const lastMonthYear = lastMonthDate.getFullYear();
	const lastMonthMonth = lastMonthDate.getMonth() + 1; // Note: January is represented as 0, so we add 1 to get the correct month
	const lastMonthDay = lastMonthDate.getDate();
	const lastMonthDateString = `${lastMonthYear}-${lastMonthMonth.toString().padStart(2, '0')}-${lastMonthDay.toString().padStart(2, '0')} 00:00:00`;

	const [vibrations, setVibrations] = useState([]);
	const [prevDoses, setPrevDoses] = useState([]);
	const isFocused = useIsFocused();
	useFocusEffect(
		React.useCallback(() => {
			const payload = {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: global.user_id, time_to_get:lastMonthDateString}),
			};
			fetch("http://34.233.185.82:3306/week_history", payload)
				.then((response) => response.json())
				.then((data) => {
					console.log(data);
					data = data.doses;
					setPrevDoses(data);
					
					//for second graph 
					fetch("http://34.233.185.82:3306/vibrations", payload)
					.then((response) => response.json())
					.then((data) => {
					data = data.result;
					setVibrations(data);
				})
				.catch((error) => console.error(error));
				})
		}, [])
	);

	//for graph1
	// Extracting the list of dates
	const dates = prevDoses.map((item) => item.date);
	console.log("Dates:", dates);

	// Extracting the list of dosages
	const dosages = prevDoses.map((item) => item.dosages);
	console.log("Dosages:", dosages);

	// Extracting the list of dosage counts
	const dosageCounts = prevDoses.map((item) => item.dosage_count);
	console.log("Dosage Counts:", dosageCounts);

	const getLast7Days = () => {
		const last7Dates = dates.slice(-7);
		const last7Days = last7Dates.map(date => {
			const [day, month, year] = date.split('-');
		  return day;
		});
		console.log (last7Dates)
		return last7Days;
	  };
	
	  
	  const getLast7DaysTheMonth = () => {
		const last7Dates = dates.slice(-7);
		
		if (last7Dates !== undefined &&last7Dates.length === 0) {
		  return null; // Return null or handle the empty array case accordingly
		}
		
		const firstDate = last7Dates[0];
		
		if (!firstDate) {
		  return null; // Return null or handle the undefined firstDate case accordingly
		}
		
		const [day, month, year] = firstDate.split('-');
		const monthNumber = parseInt(month, 10);
		
		// Create an array with the month names
		const monthNames = [
		  'January', 'February', 'March', 'April', 'May', 'June',
		  'July', 'August', 'September', 'October', 'November', 'December'
		];
	  
		// Return the corresponding month name based on the month number
		return monthNames[monthNumber - 1];
	  };
	  

	const getLast7DaysDosages = () => {
		const last7Dosages = dosages.slice(-7);
		return last7Dosages;
	};

	const labels = getLast7Days();
	const dosagesData = getLast7DaysDosages();
	const month = getLast7DaysTheMonth();

	const takingsData = {
		labels: labels,
		data: dosagesData,
		barColors: ["#438C9D", "#73B8C9", "#A4D6E1", "#D1EAF0"],
	};
	const chartDosesConfig = {
		backgroundGradientFrom: "#F7F3E7",
		backgroundGradientTo: "#F7F3E7",
		decimalPlaces: 0,
		color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
		contentInset: { left: 30 },
		formatYLabel: (value) => value.toFixed(0),
		};
	
	const legend = ["Taking 1", "Taking 2", "Taking 3", "Taking 4"];
	const legendColors = ["#438C9D", "#73B8C9", "#A4D6E1", "#D1EAF0"];
	const screenWidth = Dimensions.get("window").width - 20;

	// 2nd graph: shows the amount of vibrations during the day, week and month
	const vibrationsByDate = {};

	vibrations.forEach((entry) => {
	  const dateTimeParts = entry.date_time.split(" ");
	  const date = dateTimeParts[0]; // Extract the date part
	  const hour = dateTimeParts[1].split(":")[0]; // Extract the hour part
	
	  if (!vibrationsByDate[date]) {
		vibrationsByDate[date] = [];
	  }
	
	  let hourList = vibrationsByDate[date].find((list) => list[0] === hour);
	  if (!hourList) {
		hourList = [hour, 0]; // Initialize the sum of true values to 0
		vibrationsByDate[date].push(hourList);
	  }

	  const trueCount = entry.value.filter((value) => value === true).length;
	  hourList[1] += trueCount; // Increment the sum of true values for the hour
	});
	console.log("everythinggggg");
	console.log(vibrationsByDate);

	
// Today's vibrations
const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format
const vibrationsToday = [];
Object.keys(vibrationsByDate).forEach((date) => {
  if (new Date(date).toISOString().split("T")[0] >= today) {
    vibrationsByDate[date].forEach((hourData) => {
		vibrationsToday.push(hourData[1]); // Push the second part as data
    });
  }
});

// Vibrations from the last week
const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7); // Subtract 7 days to get the date from a week ago
const labelsVibrationsLastWeek = [];
const dataVibrationsLastWeek = [];
Object.keys(vibrationsByDate).forEach((date) => {
  if (new Date(date) > lastWeek) {
    vibrationsByDate[date].forEach((hourData) => {
		labelsVibrationsLastWeek.push(hourData[0]); // Push the date as labels
		dataVibrationsLastWeek.push(hourData[1]); // Push the second part as data
    });
  }
});


// Vibrations from the last month
const lastMonth = new Date();
lastMonth.setMonth(lastMonth.getMonth() - 1); // Subtract 1 month to get the date from a month ago
const vibrationsLastMonth = [];
Object.keys(vibrationsByDate).forEach((date) => {
  if (new Date(date) > lastMonth) {
    vibrationsByDate[date].forEach((hourData) => {
      vibrationsLastMonth.push(hourData[1]);
    });
  }
});

	const chartSequenceOfVibrationsConfig = {
		backgroundColor: "#F7F3E7",
		backgroundGradientFrom: "#F7F3E7",
		backgroundGradientTo: "#F7F3E7",
		decimalPlaces: 2,
		labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
		style: {
		  borderRadius: 16
		},
		color: (opacity = 255) => `rgba(67, 140, 157, ${opacity})`,
		style: {
		  borderRadius: 16,
		},
	  };


	return (
		<ScrollView style={styles.ScrollViewStyle}>
			<View
				style={{
					flex: 1,
					alignItems: "center",
					justifyContent: "center",
					backgroundColor: "#F7F3E7",
					paddingTop: 100,
				}}
			>
			<Image
				style={{
					resizeMode: "center",
					height: 220,
					width: 300,
				}}
				source={require("./assets/Analytics.png")}
			/>
			
			<Text style={styles.title}>Analytics</Text>
			<Text style={styles.homeText}>Presented here analysis of your intake and tremors, in the hope that with the help of the information you will be able to adjust the dose of the medicine in the way that suits you best{"\n"}</Text>
				<View style={{ flexDirection: "row" }}>
					{legend.map((item, index) => (
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								marginRight: 10,
							}}
							key={index}
						>
							<View
								style={{
									width: 10,
									height: 10,
									backgroundColor: legendColors[index],
									marginRight: 5,
								}}
							/>
							<Text>{item}</Text>
						</View>
					))}
				</View>
				<Text style = {styles.homeText}>{month}</Text>
				<View style={{ marginLeft: 60, marginRight: 60  }}>
					<StackedBarChart
						style={{ marginVertical: 8, marginLeft: 10 }}
						data={takingsData}
						width={screenWidth - 20}
						height={250}
						chartConfig={chartDosesConfig}
					/>
					<Text style={styles.homeText}>Today's tremors</Text>
					{vibrationsToday && (
					<LineChart
						data={{ datasets: [{ data: vibrationsToday }] }}
						chartConfig={chartSequenceOfVibrationsConfig}
						width={screenWidth - 20}
						height={250}
						verticalLabelRotation={30}
						bezier
					/>
					)}
					<Text style = {styles.homeText}>This week's tremors</Text>
					<LineChart
						data={{datasets: [{data: dataVibrationsLastWeek,},],}}
						chartConfig={chartSequenceOfVibrationsConfig}
						width={screenWidth-10}
						height={250}
						verticalLabelRotation={30}
						bezier
						/>
					<Text style = {styles.homeText}>This month's tremors</Text>
					<LineChart
						data={{datasets: [{data: vibrationsLastMonth,},],}}
						chartConfig={chartSequenceOfVibrationsConfig}
						width={screenWidth-20}
						height={250}
						verticalLabelRotation={30}
						bezier
						/>
				</View>
			</View>
		</ScrollView>
	);
}

const CalendarScreen = () => {
	const [selectedDate, setSelectedDate] = useState(null);
	const [popupData, setPopupData] = useState(null);
	const [modalVisible, setModalVisible] = useState(false);

	const handleDayPress = async (day) => {
		setSelectedDate(day.dateString);
		try {
			const response = await fetch("http://34.233.185.82:3306/get_day_info", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ id: global.user_id, date: day.dateString }),
			});
			const data = (await response.json());
			const dosages = data.dosages;
			const falls = data.falls;
			console.log(dosages)
			console.log(falls)
			setPopupData({ dosages, falls });
			openModal();
		} catch (error) {
			console.error("Error:", error);
			setPopupData(null);
		}
	};

	const closeModal = () => {
		setModalVisible(false);
	};

	const openModal = () => {
		setModalVisible(true);
	};

	const renderPopup = () => {
		if (!modalVisible) return null;

		return (
			<View style={styles.modalWindow} >
				<Modal visible={modalVisible} animationType="slide" transparent>
					<View style={stylesCalender.modalContainer}>
						<ScrollView>
					<Text style={stylesCalender.modalTitle}>
						 {moment(selectedDate).format("MMMM D, YYYY")}
							</Text>
							{popupData.dosages.map((item, index) =>
							Array.isArray(item) && item.length >= 2 ? (
							<View style={stylesCalender.popupItem} key={index}>
								<Text>{`${index + 1}) Dosage: ${item[0]}, Time: ${item[1]} `}</Text>
							</View>
							) : null
						)}
						{popupData.falls && (
							<View>
							{popupData.falls.map((fall, index) => (
								<View style={stylesCalender.popupFall} key={index}>
								<Text>Fall detected in {`${fall}`}</Text>
								</View>
							))}
							</View>
						)}
											<View style={styles.buttonContainer}>
								<TouchableOpacity
									onPress={closeModal}
									style={styles.button}
								>
								<Text style={styles.buttonText}>Close</Text>
								</TouchableOpacity>
							</View>
						</ScrollView>
					</View>
				</Modal>
			</View>
		);
	};

	return (
		<View style={stylesCalender.screenContainer}>
			<Image
				style={{
				resizeMode: "contain",
				height: 300,
				width: 350,
				marginTop: 30,
				}}
			source={require("./assets/calender.png")}/>
			<Calendar
				onDayPress={handleDayPress}
				markedDates={{
					[selectedDate]: { selected: true, selectedColor: "#2979FF" },
				}}
			/>
			{selectedDate && (
				<View style={styles.selectedDateContainer}>
					<Text style={styles.selectedDateText}>
						{moment(selectedDate).format("MMMM D, YYYY")}
					</Text>
				</View>
			)}
			{renderPopup()}
		</View>
	);
};

const AllPrevDosesScreen = ({ navigation }) => {
	return (
		<View style={stylesCalender.screenContainer}>
			<View style={stylesCalender.calendarContainer}>
				<CalendarScreen />
			</View>
		</View>
	);
};

const stylesCalender = StyleSheet.create({
	screenContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#F7F3E7",

	},
	calendarContainer: {
		width: "90%",
		height: "90%",
		backgroundColor: "#F7F3E7",
	},
	container: {
		flex: 1,
		paddingTop: 20,
		paddingHorizontal: 16, 	
	},
	selectedDateContainer: {
		marginTop: 20,
		padding: 10,
		backgroundColor: "#f0f0f0",
		borderRadius: 8,
	},
	selectedDateText: {
		fontSize: 16,
		fontWeight: "bold",
		textAlign: "center",
	},
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalWindow: {
		backgroundColor: "#fff",
		padding: 20,
		borderRadius: 8,
		paddingTop: 1000,
		justifyContent: "center",
		alignItems: "center",
		flex: 1,
	},
	modalContainer: {
		backgroundColor: "#F7F3E7",
		padding: 20,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
		flex: 1,
		justifyContent: "flex-start",
		marginTop: 380,
		marginLeft:30,
		marginRight: 30,
		borderWidth: 5,
		borderColor: "#438C9D", 
		
		
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 10,
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	popupContent: {
		marginTop: 20,
	},
	popupItem: {
		backgroundColor: "#fff",
		padding: 10,
		borderRadius: 8,
		borderColor:"#438C9D",
		borderWidth: 2,
		marginBottom: 10,
	},
	popupFall: {
		backgroundColor: "#fff",
		padding: 10,
		borderRadius: 8,
		borderColor:"#BC6665",
		borderWidth: 2,
		marginBottom: 10,
		alignItems: "center",
	},
	popupText: {
		fontSize: 16,
		fontWeight: "bold",
		textAlign: "center",
	},
});

function SettingsAndProfileScreen({ navigation }) {
	const [fname, setFName] = useState("");
	const [lname, setLName] = useState("");
	const [age, setAge] = useState("");
	const [medicine_name, setMedicine] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [emergencyContacts, setEmergencyContacts] = useState(["", "", ""]);

	useEffect(() => {
		fetch("http://34.233.185.82:3306/get_user", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ id: global.user_id }),
		})
			.then((response) => response.json())
			.then((data) => {
				data = data.user;
				console.log("data = " + data.age);
				setFName(data.first_name);
				setLName(data.last_name);
				setAge(data.age.toString());
				setMedicine(data.medicine_name);
				setEmail(data.email);
				setEmergencyContacts([data.contact1, data.contact2, data.contact3]);
			})
			.catch((error) => console.error(error));
	}, []);

	const handleAddEmergencyContact = () => {
		if (emergencyContacts.length < 3) {
			setEmergencyContacts([...emergencyContacts, ""]);
		}
	};

	const SaveChangesButtonAlert = () => {
		payload = {
			id: global.user_id,
			first_name: fname,
			last_name: lname,
			age: age,
			email: email,
			password: password,
			contacts: emergencyContacts,
		};
		console.log(payload);
		fetch("http://34.233.185.82:3306/update_user_information", {
			method: "POST",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		})
			.then((response) => response.json())
			.then((data) => {
				const message = "Changes saved!";
				Alert.alert("Action completed", message, [
					{
						text: "Edit",
						onPress: () => console.log("Edit Pressed"),
						style: "Edit",
					},
					{
						text: "OK",
						onPress: () => {
							navigation.navigate("FrontHome");
						},
					},
				]);
			})
			.catch((error) => console.error(error));
	};

	const handleRemoveEmergencyContact = (indexToRemove) => {
		setEmergencyContacts((contacts) =>
			contacts.filter((_, index) => index !== indexToRemove)
		);
	};

	return (
		<View
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#F7F3E7",
			}}
		>
			<ScrollView>
				<Image
					style={{
						resizeMode: "contain",
						height: 300,
						width: 350,
						marginTop: 30,
					}}
					source={require("./assets/profile.png")}
				/>
				<Text style={[styles.title, { marginTop: -30 }]}>Profile</Text>
				<TextInput
					style={styles.signUpInput}
					placeholder="first name"
					value={fname}
					onChangeText={setFName}
					returnKeyType="done"
					alignItems={"center"}
					justifyContent={"center"}
				/>
				<TextInput
					style={styles.signUpInput}
					placeholder="last name"
					value={lname}
					onChangeText={setLName}
					returnKeyType="done"
					alignItems={"center"}
					justifyContent={"center"}
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
					placeholder="medicine name"
					value={medicine_name}
					onChangeText={setMedicine}
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
				<Text style={styles.homeText}>Emergency Contacts:</Text>
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
								color={"#BC6665"}
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
						color={"#438C9D"}
					/>
				)}
				<TouchableOpacity
					style={styles.saveButton}
					onPress={SaveChangesButtonAlert}
				>
					<Text style={styles.buttonText}>Submit</Text>
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
}

// ************************************************************Login sceen*********************************************************

//this is in http request

function LogInAppScreen({ navigation }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleLogin = () => {
		const requestOptions = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: email, password: password }),
		};
		console.log(requestOptions);
		fetch("http://34.233.185.82:3306/login", requestOptions)
			.then((response) => response.json())
			.then((data) => {
				if (data["answer"] === 1) {
					global.user_id = data["user"]["id"];
					navigation.navigate(Home, { email, password });
				} else {
					console.log("User does not exist");
					alert("User does not exist");
				}
				console.log(data);
			})
			.catch((error) => console.error(error));
	};

	return (
		<View
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#F7F3E7",
			}}
		>
			<Image
				style={{
					resizeMode: "cover",
					height: 200,
					width: 350,
				}}
				source={require("./assets/backImage.png")}
			/>
			<Text style={styles.title}>Login</Text>
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
				color={"#438C9D"}
				onPress={() => navigation.navigate("ForgotPassword")}
			/>
			<View style={styles.buttonContainer}>
				<TouchableOpacity
					onPress={handleLogin}
					//onPress={()=>navigation.navigate('FrontHome')}
					style={styles.button}
				>
					<Text style={styles.buttonText}>Login</Text>
				</TouchableOpacity>
			</View>
			<Text style={styles.homeText}>New to Stayble?</Text>
			<Button
				title="SignUp"
				fontSize={10}
				onPress={() => navigation.navigate("SignUp")}
				color={"#438C9D"}
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
      const response = await fetch('http://172.20.10.5:3306/reset_password', {
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
	const [email, setEmail] = useState("");
	return (
		<View
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#F7F3E7",
			}}
		>
			<Image
				style={{
					resizeMode: "cover",
					height: 320,
					width: 300,
				}}
				source={require("./assets/ForgotPassword.png")}
			/>
			<Text style={styles.title}>Forgot Password?</Text>
			<TextInput
				style={styles.logInInput}
				placeholder="Email"
				value={email}
				onChangeText={setEmail}
				keyboardType="email-address"
				returnKeyType="done"
			/>
			<Text style={styles.homeText}>Don't worry! it happenes.</Text>
			<Text style={styles.homeText}>
				Please enter the email address associated with your account.{"\n"}{" "}
			</Text>

			<View style={styles.buttonContainer}>
				<TouchableOpacity
					//onPress= {signInWithEmailAndPassword}
					onPress={() => navigation.navigate("ResetPassword", { email })}
					style={styles.button}
				>
					<Text style={styles.buttonText}>Submit</Text>
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
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const route = useRoute();
	const email = route.params.email;

	const SaveChangesButtonAlert = () => {
		if (!password || !confirmPassword) {
			Alert.alert("Error", "Please fill in both password fields");
			return;
		}

		if (password !== confirmPassword) {
			Alert.alert("Error", "Passwords do not match");
			return;
		}

		const payload = {
			email: email,
			password: password,
		};

		const response = fetch("http://34.233.185.82:3306/reset_password", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (response.ok) {
			navigation.navigate("FrontHome");
		} else {
			// handle error case here
		}
	};

	return (
		<View
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#F7F3E7",
			}}
		>
			<Image
				style={{
					resizeMode: "cover",
					height: 320,
					width: 300,
				}}
				source={require("./assets/forgotPasswordImage.png")}
			/>
			<Text style={styles.title}>Reset Password</Text>

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
				<TouchableOpacity
					style={styles.button}
					onPress={SaveChangesButtonAlert}
				>
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
	const [fname, setFName] = useState("");
	const [lname, setLName] = useState("");
	const [age, setAge] = useState("");
	const [medicine_name, setMedicine] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = () => {
		// TODO: implement form submission logic
	};

	const NextButtonAlert = () => {
		const message = " ";
		Alert.alert("You are half way there!", message, [
			{
				text: "Edit",
				onPress: () => console.log("Edit Pressed"),
				style: "Edit",
			},
			{
				text: "OK",
				onPress: () => {
					// Call SQL function to save data here??
					navigation.navigate("EmrContacts", {
						fname,
						lname,
						age,
						medicine_name,
						email,
						password,
					});
				},
			},
		]);
	};

	return (
		<View
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#F7F3E7",
			}}
		>
			<ScrollView>
				<Image
					style={{
						resizeMode: "contain",
						height: 350,
						width: 350,
					}}
					source={require("./assets/signup.png")}
				/>
				<Text style={[styles.title, { marginTop: -70 }]}>SignUp</Text>
				<TextInput
					style={styles.signUpInput}
					placeholder="first name"
					value={fname}
					onChangeText={setFName}
					returnKeyType="done"
					alignItems={"center"}
					justifyContent={"center"}
					required={true}
				/>
				<TextInput
					style={styles.signUpInput}
					placeholder="last name"
					value={lname}
					onChangeText={setLName}
					returnKeyType="done"
					alignItems={"center"}
					justifyContent={"center"}
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
					placeholder="Medicine name"
					value={medicine_name}
					onChangeText={setMedicine}
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
	const [emergencyContacts, setEmergencyContacts] = useState([""]);
	const route = useRoute();
	const fname = route.params.fname;
	const lname = route.params.lname;
	const age = route.params.age;
	const medicine_name = route.params.medicine_name;
	const email = route.params.email;
	const password = route.params.password;

	const SaveChangesButtonAlert = async () => {
		try {
			const responseMac = await fetch(
				"https://io.adafruit.com/api/v2/matanbakva/feeds/",
				{
					headers: {
						"X-AIO-Key": "aio_OgzQ40DJCO3WVskhYoiwi1imzQMK",
						"Content-Type": "application/json",
					},
				}
			);
			const data = await responseMac.json();
			const mac = data[1]["last_value"];

			const payload = {
				contacts: emergencyContacts,
				first_name: fname,
				last_name: lname,
				age: age,
				password: password,
				email: email,
				medicine_name: medicine_name,
				mac: mac,
			};
			console.log(payload);

			if (responseMac.ok) {
				const response = await fetch("http://34.233.185.82:3306/signup", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(payload),
				});

				if (response.ok) {
					const data = await response.json();
					global.user_id = data["result"];
					Alert.alert("Action completed", "user added successfully", [
						{
							text: "go to home page",
							onPress: () => navigation.navigate(Home, { email, password }),
							style: "Edit",
						},
					]);
				} else {
					// handle errors
					const data = await response.json();
					const message = data["result"];
					Alert.alert("Action Failed", message, [
						{
							text: "return to last page",
							onPress: () => navigation.navigate("SignUp"),
							style: "Edit",
						},
					]);
				}
			}
		} catch (error) {
			console.log(error);
		}
	};

	const handleAddEmergencyContact = () => {
		if (emergencyContacts.length < 3) {
			setEmergencyContacts([...emergencyContacts, ""]);
		}
	};

	const handleRemoveEmergencyContact = (indexToRemove) => {
		setEmergencyContacts((contacts) =>
			contacts.filter((_, index) => index !== indexToRemove)
		);
	};

	return (
		<View
			style={{
				flex: 1,
				alignItems: "center",
				justifyContent: "center",
				backgroundColor: "#F7F3E7",
			}}
		>
			<Text style={styles.title}>Emergency Contacts:</Text>
			<Text style={styles.homeText}>
				If we detect that you have fallen,{"\n"} we will notify the people you
				specify on this {"\n"}screen by sending them an email.{"\n\n"} You can
				enter the email addresses of up to three individuals.
			</Text>
			{emergencyContacts.map((contact, index) => (
				<View key={index}>
					<TextInput
						width={300}
						height={40}
						style={styles.signUpInput}
						returnKeyType="done"
						placeholder={`Emergency Contact ${index + 1} Email Address`}
						value={contact}
						alignItems={"center"}
						justifyContent={"center"}
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
							color={"#BC6665"}
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
					color={"#438C9D"}
				/>
			)}
			<TouchableOpacity
				style={styles.saveButton}
				onPress={SaveChangesButtonAlert}
			>
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
			<Stack.Screen
				name="LogInApp"
				component={LogInAppScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="ForgotPassword"
				component={ForgotPasswordScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="ResetPassword"
				component={ResetPasswordScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="SignUp"
				component={SignUpScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="EmrContacts"
				component={EmrContactsScreen}
				options={{ headerShown: false }}
			/>
		</Stack.Navigator>
	);
};

const Home = () => {
	return (
		<Tab.Navigator
			tabBarOptions={{
				activeTintColor: "#438C9D",
				inactiveTintColor: "gray",
			}}
		>
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
						<Stack.Screen
							name="FrontHome"
							component={FrontHomeScreen}
							options={{ headerShown: false }}
						/>
						<Stack.Screen
							name="NewDose"
							component={NewDoseScreen}
							options={{ headerShown: false }}
						/>
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
				name="Analytics"
				component={AnalyticsScreen}
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
				<Stack.Screen
					name="Auth"
					component={Auth}
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="Home"
					component={Home}
					options={{ headerShown: false }}
				/>
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default App;

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
	ScrollViewStyle: {
		flexGrow: 1,
	},
	containerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		backgroundColor: "#F5F5F5",
		borderRadius: 8,
		padding: 16,
		marginHorizontal: 16,
		width: windowWidth - 32,
		height: 70,
		marginTop: 40,
	},
	labelRow: {
		fontSize: "auto",
		fontWeight: "bold",
		marginBottom: 4,
	},
	textRow: {
		fontSize: "auto",
		marginBottom: 8,
	},
	BraceletStatus: {
		paddingHorizontal: 15,
		paddingVertical: 10,
		borderRadius: 10,
		marginTop: 5,
		textAlign: "center",
		borderColor: "#438C9D",
		borderWidth: 3,
		backgroundColor: "white",
	},
	title: {
		fontSize: 26,
		marginTop: 20,
		marginBottom: 20,
		paddingHorizontal: 15,
		paddingVertical: 5,
		textAlign: "center",
		fontWeight: "bold",
	},
	homeText: {
		fontSize: 16,
		marginTop: 20,
		marginBottom: 20,
		paddingHorizontal: 15,
		paddingVertical: 5,
		textAlign: "center",
	},
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#F7F3E7",
		marginBottom: 100,
	},
	inputContainer: {
		width: "80%",
	},
	input: {
		width: 150, // set a fixed width
		height: 50, // set a fixed height
		backgroundColor: "white",
		borderRadius: 10,
		marginTop: 5,
		textAlign: "center",
	},
	logInInput: {
		width: 250, // set a fixed width
		height: 40, // set a fixed height
		backgroundColor: "white",
		borderRadius: 10,
		marginTop: 5,
		textAlign: "center",
	},
	signUpInput: {
		height: 40,
		backgroundColor: "white",
		borderRadius: 10,
		padding: 10,
		margin: 5,
		textAlign: "center",
	},
	buttonContainer: {
		justifyContent: "center",
		alignItems: "center",
		marginTop: 40,
	},
	button: {
		backgroundColor: "#438C9D",
		width: 150, // set a fixed width
		height: 50, // set a fixed height
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 20,
	},
	buttonOutline: {
		backgroundColor: "white",
		borderColor: "#438C9D",
		borderWidth: 2,
		width: 150, // set a fixed width
		height: 50, // set a fixed height
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "700",
		textAlign: "center",
	},
	buttonOutlineText: {
		color: "#438C9D",
		fontSize: 16,
		fontWeight: "700",
		textAlign: "center",
	},
	saveButton: {
		backgroundColor: "#438C9D",
		padding: 10,
		borderRadius: 10,
		margin: 10,
		alignSelf: "center",
		width: 150, // set a fixed width
		height: 50, // set a fixed height
		marginTop: 20,
		alignItems: "center",
		textAlign: "center",
	},
	inputData: {
		backgroundColor: "white",
		width: "50%",
		paddingHorizontal: 15,
		paddingVertical: 10,
		borderRadius: 10,
		marginTop: 5,
	},
	recommendation: {
		backgroundColor: "white",
		paddingHorizontal: 20,
		paddingVertical: 20,
		borderRadius: 20,
		marginTop: 20,
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
		width: "80%",
	},
	header: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 30,
		borderBottomColor: "black",
		borderBottomWidth: 2,
	},
});
