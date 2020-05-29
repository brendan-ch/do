import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from 'react-native-vector-icons';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';

import { getData, setData } from '../components/Sync';

const Todo = ({ title, description, complete, onChangeText, id }) => {  // todo object (what shows up in FlatList)

  return (
    <View style={styles.todo}>
      <TouchableOpacity style={styles.checkbox}>
        <Ionicons name={complete ? "ios-checkmark-circle" : "ios-radio-button-off"} size={30} color="#b0b0b0"/>
      </TouchableOpacity>
      <TextInput style={styles.todoInput} value={title} onChangeText={(text) => onChangeText(id, text)} />
    </View>
  )
}

export default function List({ route }) {
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);

  const _getList = async (id) => {  // id: integer or string
    try {
      const response = await getData("list-".concat(typeof id === "string" ? id : toString(id)));
      const parsedResponse = JSON.parse(response);  // i spent an hour debugging this and forgot to parse...fml

      setList(parsedResponse);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  }

  // ~~~~~~~~~~OLD CODE~~~~~~~~~~
  // const _updateData = async (newList) => {  // doesn't use state data (need to update stuff immediately on change)
  //   const listsAsString = await AsyncStorage.getItem('lists');  // old data
  //   const lists = JSON.parse(listsAsString);

  //   const newLists = lists.map((item) => {
  //     const updatedItem = item.id === newList.id ? newList : item
  //     // if (item.id === newList.id) {
  //     //   let updatedItem = newList;
  //     // }

  //     return updatedItem;
  //   });

  //   console.log("newLists", newLists);

  //   await AsyncStorage.setItem('lists', JSON.stringify(newLists));
  // }
  // ~~~~~~~~~~END OLD CODE~~~~~~~

  const _updateList = (property, newValue) => {
    let newList;

    console.log(property);

    switch(property) {
      case "title": 
        newList = { ...list, title: newValue };
        break;
      case "description": 
        newList = { ...list, description: newValue };
        break;
      case "todos": 
        newList = { ...list, todos: newValue };
        break;
      default: 
        newList = { ...list };
        break;
    }

    console.log(newList);

    setList(newList);
    setData("list-".concat(list.id), newList);
  }

  const _onChangeText = (id, text) => {
    const newListTodos = list.todos.map((item) => {
      if (item.id === id) {
        let updatedItem = item;
        updatedItem.title = text;
      }

      return item;
    });

    setList({ ...list, todos: newListTodos });  // WHY IS THE ... ACTUALLY PART OF THE SYNTAX WTF

    setData("list-".concat(list.id), {...list, todos: newListTodos});
  }

  const _onCreateTodo = () => {
    let newListTodos = list.todos;
    
    // id generation
    // currently doesn't check for duplicate ids, will implement "later"
    const id = Math.round(Math.random() * 100000000);

    newListTodos.push({
      title: "",
      description: "",
      complete: false,
      id: id.toString(),
    });

    setList({ ...list, todos: newListTodos });  // WHY IS THE ... ACTUALLY PART OF THE SYNTAX WTF
    // _updateData({ ...list, todos: newListTodos });

    // i really, really hope this works
    // UPDATE: IT WORKED LET'S GOOOOOOOOOO
    setData("list-".concat(list.id), {...list, todos: newListTodos});  // uses new component
  }

  useEffect(() => {
    _getList(route.params.list.id);
  }, [])

  // console.log("Current list data in state:", list);
  // console.log("Current list of todos in state:", list ? list.todos : "list object doesn't exist");
  // console.log("Current list title:", list ? list.title : "list object doesn't exist");

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.headerContainer}>
        <TextInput 
          style={styles.heading} 
          allowFontScaling={false}
          onChangeText={(text) => {
            _updateList("title", text);
          }}
        >{list ? list.title : "No title"}</TextInput>
        <TouchableOpacity onPress={_onCreateTodo}>
          <Ionicons name="ios-add-circle" size={35} color="rgba(0, 122, 255, 1)" />
        </TouchableOpacity>
      </View>
      {list ?  // a ton of conditional stuff for some reason
        list.todos && list.todos.length !== 0 ? 
          <KeyboardAwareFlatList   // replacement for FlatList; moves with keyboard
            data={list.todos}
            renderItem={({ item }) => <Todo title={item.title} id={item.id} description={item.description} complete={item.complete} onChangeText={(id, text) => _onChangeText(id, text)} />}
            keyExtractor={item => item.id}
            style={styles.listContainer}
          />
        :
          loading ?
            <Text style={styles.placeholderText} allowFontScaling={false}>Loading...</Text>  // user should rarely see this (except on first load)
          :
            <Text style={styles.placeholderText} allowFontScaling={false}>Tap the button above to create your first to-do!</Text>
      
      :
        loading ? 
          <Text style={styles.placeholderText} allowFontScaling={false}>Loading...</Text>  // user should rarely see this (except on first load)
        :
          <Text style={styles.placeholderText} allowFontScaling={false}>An error occurred while loading your to-dos. Please try again later.</Text>
      }
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 90,
    marginHorizontal: 10,
  },
  heading: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    flex: 1,
  },
  placeholderText: {
    alignSelf: "center",
    marginTop: 20,
    fontSize: 17,
    fontStyle: "italic",
    color: "#b0b0b0"
  },
  todo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 55,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f2f2f2"
  },
  checkbox: {
    margin: 10,
  },
  todoInput: {
    color: "#000000",
    flex: 1,
    height: 55,
    fontSize: 17,
  }
})