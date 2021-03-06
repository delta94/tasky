import React from 'react';
import PropTypes from 'prop-types';
import {TouchableHighlight, TouchableOpacity, View} from 'react-native';
import {Table, TableWrapper, Row, Cell} from 'react-native-table-component';
import {MaterialIcons} from '@expo/vector-icons'
import {styles} from './styles';
import Colors from "~/theming/colors";
import {isOdd, randomUUID} from "~/utils/method";
import {ContentType} from "~/utils/model/Content";

const propTypes = {
    onFilterRow: PropTypes.func,
    onRowSelected: PropTypes.func,
    onDeleteRow: PropTypes.func,
    data: PropTypes.arrayOf(
        PropTypes.shape({}),
    )
};

const defaultProps = {
    data: []
};

const List = ({onFilterRow, onRowSelected, onDeleteRow, data}: {
    onFilterRow: (flag: string, currentIndex: number) => void
    onRowSelected: (data: ContentType) => void
    onDeleteRow: (data: ContentType) => void
    data: Array<ContentType>;
}) => {

    const ROW_HEAD_TITLES = ['Name', 'Type', 'Delay', 'Actions'];

    const ViewActions = (content: ContentType, index: number) => (
        <View style={{
            flex: 1,
            flexDirection: "row",
            alignContent: "center",
            alignItems: "center",
            justifyContent: "center",
        }}>
            <TouchableOpacity onPress={() => onFilterRow("UP", index)} style={{flexDirection: "row"}}>
                <MaterialIcons name={"arrow-upward"} size={22} color={Colors.blue}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onFilterRow( "DOWN", index)} style={{flexDirection: "row"}}>
                <MaterialIcons name={"arrow-downward"} size={22} color={Colors.black100}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDeleteRow(content)}>
                <MaterialIcons name={"delete"} size={22} color={Colors.redOpaque}/>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={{marginBottom: 20, marginTop: 1}}>
            <View style={styles.container}>
                <Table style={styles.table}>
                    <Row data={ROW_HEAD_TITLES} style={styles.head} textStyle={styles.titleText}/>
                    {
                        data.map((content: ContentType, index) => (
                            <TouchableHighlight key={randomUUID()}
                                                activeOpacity={0.2}
                                                underlayColor={isOdd(index) ? Colors.white : Colors.filterViolet}
                                                onPress={() => onRowSelected(content)}>
                                <TableWrapper key={randomUUID()}
                                              style={Object.assign({}, styles.row, {backgroundColor: isOdd(index) ? Colors.white : Colors.filterViolet})}>
                                    <Cell key={randomUUID()}
                                          data={content.name}
                                          textStyle={styles.text}/>

                                    <Cell key={randomUUID()}
                                          data={content.type}
                                          textStyle={styles.text}/>

                                    <Cell key={randomUUID()}
                                          data={content.delay}
                                          textStyle={styles.text}/>

                                    <Cell key={randomUUID()}
                                          data={ViewActions(content, index)}
                                          textStyle={styles.text}/>

                                </TableWrapper>
                            </TouchableHighlight>
                        ))
                    }
                </Table>
            </View>
        </View>
    );
};

List.propTypes = propTypes;
List.defaultProps = defaultProps;

export default List;
