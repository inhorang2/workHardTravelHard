import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert, Keyboard, Platform} from 'react-native';
import { theme } from "./colors";
import { useEffect, useState, useRef } from 'react';
import { Fontisto, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = "@toDos"

export default function App() {

  const refInput = useRef();

  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [checkbox, setCheckbox] = useState(false);
  const [editText, setEditText] = useState(false);
  const [editBox, setEditBox] = useState("");
  const [aaaaa, setaaaaa] = useState("");
  const [toDos, setToDos] = useState({});
  useEffect(()=>{
    loadToDos();
    const hideSubcription = Keyboard.addListener('keyboardDidHide', 
    () => {
      setEditText(false);
    })
  }, []);
  const work = () => setWorking(true);
  const travel = () => setWorking(false);
  const onChangeText = (payload) => setText(payload);
  const onEditingText = (payload) => setaaaaa(payload);
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.log(e);
    }
  }
  const loadToDos = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if (s) {
        setToDos(JSON.parse(s));
      }
    } catch (e) {
      console.log(e);
    }
  }
  const addTodo = async () => {
    if (text===""){
      return;
    }
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, checkbox }
    }
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = async(key) => {
    if(Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do?")
      if (ok) {
        const newToDos = {...toDos};
        delete newToDos[key];
        setToDos(newToDos);
        saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete"+" "+JSON.stringify(toDos[key].text), "Are you sure?", [
        { text:"Cancel" },
        { text:"I'm sure",
          onPress: async() => {
          const newToDos = {...toDos};
          delete newToDos[key];
          setToDos(newToDos);
          await saveToDos(newToDos);
          }
        }
      ])
    }
  }

  const changeStatus = async(key) => {
    const newToDos = {...toDos};
    if(newToDos[key].checkbox===true){
      newToDos[key].checkbox=false;
    }else{
      newToDos[key].checkbox=true;
    }
    setToDos(newToDos);
    await saveToDos(newToDos);
  }

  const changeText = async(key) => {
    setEditText(true);
    setEditBox(key);
    setaaaaa(toDos[key].text);
    console.log('key', key)
    refInput.current.focus()
  }

  const editTodo = async() => {
    if (aaaaa===""){
      return;
    }
    const editToDos = {...toDos};
    editToDos[editBox].text = aaaaa;
    setEditText(false);
    setToDos(editToDos);
    await saveToDos(editToDos);
  }

  console.log(toDos);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text style={{...styles.btnText, color: working ? "white": theme.grey}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text style={{...styles.btnText, color: !working ? "white": theme.grey}}>Travel</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        ref = {refInput}
        value= { editText === false ? text : aaaaa }
        onChangeText={ editText === false ? onChangeText : onEditingText}
        onSubmitEditing={ editText === false ? addTodo : editTodo }
        returnKeyType="done"
        style={styles.input}
        placeholder={working ? 'Add a To Do' : 'where do you want to go?'}
      />
      <ScrollView>
        {Object.keys(toDos).map((key)=>(
          toDos[key].working === working ? 
            <View style={styles.toDo} key={key}>
              <View style={styles.toDoFront}>
                <TouchableOpacity onPress={()=>changeStatus(key)}>
                  { toDos[key].checkbox === true ?
                  <Fontisto name="checkbox-active" size={19} color="black" />
                  : <Fontisto name="checkbox-passive" size={20} color="black" /> }
                </TouchableOpacity>
                  { toDos[key].checkbox === true ?
                  <Text style={{...styles.toDoText, textDecorationLine: "line-through", color: "#B4B4B4"}}> {toDos[key].text} </Text>
                  : <Text style={styles.toDoText}> {toDos[key].text} </Text> }
              </View>
              <View style={styles.toDoBack}>
                <TouchableOpacity onPress={()=>{changeText(key)}}><Feather name="edit-2" size={18} color="black" style={{marginRight:15}}/></TouchableOpacity>
                <TouchableOpacity onPress={()=>deleteToDo(key)}><Fontisto name="trash" size={20} color="black" /></TouchableOpacity>
              </View>
            </View>
          : null
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal:20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop:100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: "white",
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor : theme.toDoBg,
    marginBottom : 10,
    paddingVertical : 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color:"white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 5
  },
  toDoFront: {
    flexDirection: 'row',
    alignItems: "center"
  },
  toDoBack: {
    flexDirection: 'row',
    alignItems: "center",
  },
});
