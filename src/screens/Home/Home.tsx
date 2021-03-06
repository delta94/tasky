import * as React from "react";
import Container from "~/components/common/Container";
import AuxHOC from "~/container/AuxHOC";
import List from "~/components/common/list/List";
import Header from "~/components/common/header";
import Fab from "~/components/common/Fab";
import {useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Modalize} from "react-native-modalize";
import {View, Image, Alert} from "react-native";
import Text from "~/components/common/Text";
import styles from "~/screens/Home/styles";
import LabelInput from "~/components/common/Input";
import LabelSelect from "~/components/common/Select";
import Button from "~/components/common/Button";
import Colors from "~/theming/colors";
import Slider from '@react-native-community/slider';
import Loader from "~/components/common/Loader";
import {contentDelay, contentType} from "~/utils/data";
import {ContentType} from "~/utils/model/Content";
import {
    addContent,
    filterContent,
    processing,
    removeAllContent,
    removeContent,
    updateContent
} from "~/actions/content-actions";
import {showToast} from "~/utils/method";

const Home = () => {

    const ACTIONS = {
        ADD: 'ADD',
        UPDATE: 'UPDATE',
        DELETE_ROW: 'DELETE_ROW',
        DELETE_ALL: 'DELETE_ALL',
        FILTER_UP: 'UP',
        FILTER_DOWN: 'DOWN',
    };

    // Get the dispatcher
    const dispatch = useDispatch();

    // Initialization
    const modalizeRef = useRef<Modalize>(null);
    const [editMode, setEditMode] = useState<boolean>(false);

    const [contentName, setContentName] = useState<string>('');
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedDelay, setSelectedDelay] = useState<string>('');
    const [tmpDelay, setTmpDelay] = useState<string>('');
    const [selectedContentId, setSelectedContentId] = useState<number | null>(null);

    // Get the reducer from Redux store
    const {loading, contents} = useSelector(({ContentReducer}: { ContentReducer: Array<ContentType> }) => ContentReducer);


    const openModalAddNewTask = () => {
        setEditMode(false);
        modalizeRef.current?.open();
        setContentName('');
        setSelectedDelay('');
        setTmpDelay('');
        setSelectedType('');
        setSelectedContentId(null)
    };

    const closeModalAddNewTask = () => {
        modalizeRef.current?.close();
    };

    const handleValueText = (value: string) => {
        setContentName(value);
    };

    const handleSelectedType = (selected: string) => {
        setSelectedType(selected);
    };

    const handleSelectedDelay = (selected: string) => {
        setSelectedDelay(selected);
    };

    const updateContentDelay = (value: number) => {
        let newDelay = '';
        if (value < 60) {
            newDelay = `${parseInt(String(value))}s`
        } else {
            newDelay = `${parseInt(String(value / 60))}min`
        }
        setSelectedDelay(newDelay)
    };

    const getMinDelayValue = () => {
        let minDelay = 0;
        if(tmpDelay != null){

            const firstchar = parseInt(tmpDelay.charAt(0));
            const secondChar = tmpDelay.charAt(1);

            if (secondChar === 'm' || secondChar === 'M') { // Current Delay is in Min
                minDelay = firstchar * 60;  // to get the value in second for the Slider
            } else {
                minDelay = firstchar  // return the value in second
            }
        }
        return minDelay;
    };

    const onFilterRow = (flag: string, currentIndex: number) => {
        let upIndex: number,
            payload: any = {flag: '', newContent: {}};
        if (flag === ACTIONS.FILTER_UP) {
            payload.flag = ACTIONS.FILTER_UP;
            if (contents.length !== 1) {
                if (contents.length == 2) {
                    if (currentIndex != 0) {
                        upIndex = 0;

                        const contentArray = contents;
                        const tmp = contentArray[upIndex];

                        contentArray[upIndex] = contentArray[currentIndex];
                        contentArray[currentIndex] = tmp;
                        payload.newContent = contentArray;

                        dispatch(filterContent(payload));
                    }
                } else {
                    if (currentIndex != 0) {
                        upIndex = currentIndex - 1;

                        const contentArray = contents;
                        const tmp = contentArray[upIndex];

                        contentArray[upIndex] = contentArray[currentIndex];
                        contentArray[currentIndex] = tmp;

                        payload.newContent = contentArray;

                        dispatch(filterContent(payload));
                    }
                }
            }
        } else {
            payload.flag = ACTIONS.FILTER_DOWN;
            if (contents.length !== 1) {
                if (contents.length == 2) {
                    if (currentIndex != 1) {

                        const contentArray = contents;
                        const tmp = contentArray[currentIndex + 1];

                        contentArray[currentIndex + 1] = contentArray[currentIndex];
                        contentArray[currentIndex] = tmp;

                        payload.newContent = contentArray;

                        dispatch(filterContent(payload));
                    }
                } else {
                    if (currentIndex != contents.length - 1) {

                        const contentArray = contents;
                        const tmp = contentArray[currentIndex + 1];

                        contentArray[currentIndex + 1] = contentArray[currentIndex];
                        contentArray[currentIndex] = tmp;
                        payload.newContent = contentArray;

                        dispatch(filterContent(payload));
                    }
                }
            }
        }
    };

    const onRowSelected = (content: ContentType) => {
        openModalAddNewTask();
        setEditMode(true);
        setContentName(content.name);
        setTmpDelay(content.delay);
        setSelectedDelay(content.delay);
        setSelectedType(content.type);
        setSelectedContentId(content.id ? content.id : null);
    };

    const performAction = (flag: string) => {
        if (contentName == '' && selectedType == '' && selectedDelay == '') {
            alert("You should provide all values")
        } else {
            if (contentName == '') {
                alert("You should provide the Content Name");
            } else {
                if (selectedType == '') {
                    alert("You should provide the Content Type");
                } else {
                    if (selectedDelay == '') {
                        alert("You should provide Content Delay");
                    } else {
                        const mContent: ContentType = {
                            name: contentName,
                            type: selectedType,
                            delay: selectedDelay
                        };
                        dispatch(processing());
                        if (flag == ACTIONS.ADD) {
                            dispatch(addContent(mContent));
                            showToast("Content added successfully");
                        } else {
                            mContent.id = selectedContentId != null ? selectedContentId : 0;
                            dispatch(updateContent(mContent));
                            showToast("Content Updated successfully");
                        }
                        closeModalAddNewTask();
                    }
                }
            }
        }
    };

    const handleDelete = (content: ContentType | null) => {
        let message = "";
        if (content == null) { // Case to delete all content
            message = "Confirm delete All content ?"
        } else { // case to delete specific row
            message = "Confirm delete this row ?"
        }
        Alert.alert(
            "Confirm",
            message,
            [
                {
                    text: "Cancel",
                    onPress: () => null,
                    style: "cancel"
                },
                {
                    text: "Confirm", onPress: () => {
                        content !== null ? dispatch(removeContent(content.id ? content.id : undefined)) :
                            dispatch(removeAllContent());
                        showToast("Deleted successfully");
                    }
                }
            ],
            {cancelable: false}
        );
    };

    const noContent = (
        <View style={styles.noContent}>
            <Image
                style={styles.defaultImg}
                source={require('~/assets/img_home.jpg')}
            />
        </View>
    );

    return (
        <AuxHOC>
            <Loader loading={loading} message={""}/>
            <Header title={"Tasky"} subtitle={"Manage your contents"} emptyList={contents.length == 0}
                    onDeleteAll={handleDelete}/>
            <Container>
                {contents.length == 0 ? noContent :
                    <List data={contents} onFilterRow={onFilterRow} onRowSelected={onRowSelected}
                          onDeleteRow={handleDelete}/>}
            </Container>
            <Modalize
                ref={modalizeRef}
                modalHeight={540}
                HeaderComponent={
                    <View
                        style={styles.headerModal}>
                        <Text
                            style={styles.textTitleModal}>
                            {editMode ? "Update content" : "Add new content"}
                        </Text>
                    </View>
                }>
                <LabelInput onTextChange={handleValueText} label={"Name"} placeholder={"Content Name *"}
                            value={contentName}/>
                <LabelSelect data={contentType} onValueChange={handleSelectedType} label={"Content type"}
                             value={selectedType}/>
                <LabelSelect data={contentDelay} onValueChange={handleSelectedDelay}
                             label={"Content delay"} value={selectedDelay}/>
                {editMode ?
                    <View style={{marginHorizontal: 16}}>
                        <Text style={{fontSize: 13, alignSelf: "flex-end", color: Colors.gray[500], marginTop: 10}}>
                            {selectedDelay}
                        </Text>
                        <Slider
                            style={{flex: 1, height: 40}}
                            minimumValue={0}
                            value={getMinDelayValue()}
                            maximumValue={300}
                            minimumTrackTintColor={Colors.violet}
                            maximumTrackTintColor={Colors.filterViolet}
                            onValueChange={updateContentDelay}
                        />
                    </View>
                    : null}
                <Button text={editMode ? "Update" : "Save"} color={Colors.violet}
                        onPress={() => editMode ? performAction(ACTIONS.UPDATE) : performAction(ACTIONS.ADD)}
                        tintColor={Colors.white}/>
            </Modalize>
            <Fab icon={"add"} onPress={openModalAddNewTask}/>
        </AuxHOC>
    )
};

export default Home;
