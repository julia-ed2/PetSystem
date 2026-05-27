import React, { useState } from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function GoalCard() {

  const [selectedGoal, setSelectedGoal] = useState('5 passeios por semana');
  const [goalNumber, setGoalNumber] = useState(5);

  const [tempGoal, setTempGoal] = useState('5 passeios por semana');
  const [tempGoalNumber, setTempGoalNumber] = useState(5);

  const [showModal, setShowModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  return (

    <View style={styles.card}>

      {/* BARRA LATERAL */}
      <View style={styles.sideBar} />

      {/* CONTEÚDO */}
      <View style={styles.cardContent}>

        {/* HEADER CARD */}
        <View style={styles.headerRow}>

          <View style={styles.titleRow}>

            <Image
              source={require('../../assets/images/Vector.png')}
              style={styles.icon}
            />

            <Text style={styles.title}>
              Metas de passeios
            </Text>

          </View>

          <TouchableOpacity onPress={() => setShowModal(true)}>

            <Image
              source={require('../../assets/images/PencilFill.png')}
              style={styles.editIcon}
            />

          </TouchableOpacity>

        </View>

        {/* TEXTO */}
        <Text style={styles.goalText}>
          Objetivo: {selectedGoal}
        </Text>

        {/* PROGRESSO */}
        <View style={styles.progressBar}>

          <View
            style={[
              styles.progressFill,
              { width: `${(goalNumber / 5) * 100}%` },
            ]}
          />

        </View>

        <Text style={styles.progressText}>
          {goalNumber}/5
        </Text>

      </View>

      {/* MODAL */}
      <Modal visible={showModal} transparent animationType="fade">

        <View style={styles.modalOverlay}>

          <View style={styles.modalContainer}>

            {/* HEADER MODAL */}
            <View style={styles.modalHeaderCentered}>

              <Text style={styles.modalTitleCentered}>
                Alterar metas de passeios
              </Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>

            </View>

            {/* SUBTÍTULO */}
            <Text style={styles.modalBoldText}>
              Metas de passeios por semana com seu pet:
            </Text>

            <Text style={styles.modalSubtitle}>
              Altere a meta quando quiser
            </Text>

            {/* DROPDOWN */}
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setShowOptions(!showOptions)}
            >

              <Text>Selecionar meta</Text>
              <Text>⌄</Text>

            </TouchableOpacity>

            {/* OPÇÕES */}
            {showOptions && (

              <View style={styles.optionsBox}>

                {[1, 2, 3, 4, 5].map((item) => (

                  <TouchableOpacity
                    key={item}
                    style={styles.option}
                    onPress={() => {

                      setTempGoal(`${item} passeios por semana`);
                      setTempGoalNumber(item);

                      setShowOptions(false);

                    }}
                  >

                    <Text>{item}x por semana</Text>

                  </TouchableOpacity>

                ))}

              </View>

            )}

            {/* BOTÕES */}
            <View style={styles.modalButtons}>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {

                  setShowModal(false);
                  setShowOptions(false);

                }}
              >

                <Text style={styles.cancelText}>
                  Cancelar
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {

                  setSelectedGoal(tempGoal);
                  setGoalNumber(tempGoalNumber);

                  setShowModal(false);
                  setShowOptions(false);

                }}
              >

                <Text style={styles.confirmText}>
                  Confirmar
                </Text>

              </TouchableOpacity>

            </View>

          </View>

        </View>

      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({

  /* CARD */
  card: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    marginTop: 10,
    marginBottom: 20,
    overflow: 'hidden',

    flexDirection: 'row',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },

    shadowOpacity: 0.08,
    shadowRadius: 6,

    elevation: 4,
  },

  /* LATERAL ROXA */
  sideBar: {
    width: 8,
    backgroundColor: '#E61E78',
  },

  /* CONTEÚDO */
  cardContent: {
    flex: 1,
    padding: 18,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* ÍCONE SOL */
  icon: {
    width: 30,
    height: 30,
    marginRight: 12,
    resizeMode: 'contain',
  },

  /* ÍCONE EDITAR */
  editIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  goalText: {
    color: '#555',
    marginTop: 10,
    marginBottom: 15,
  },

  progressBar: {
    height: 10,
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#E61E78',
  },

  progressText: {
    marginTop: 8,
    alignSelf: 'flex-end',
    color: '#8A2BE2',
    fontWeight: 'bold',
  },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
  },

  modalHeaderCentered: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  modalTitleCentered: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 5,
  },

  closeX: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  modalBoldText: {
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'left',
  },

  modalSubtitle: {
    color: '#777',
    marginBottom: 15,
  },

  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    marginBottom: 10,
  },

  optionsBox: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    marginBottom: 15,
  },

  option: {
    padding: 12,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cancelButton: {
    flex: 1,
    marginRight: 10,
    backgroundColor: '#E85A5A',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  confirmButton: {
    flex: 1,
    backgroundColor: '#8A2BE2',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  cancelText: {
    color: '#FFF',
    fontWeight: 'bold',
  },

  confirmText: {
    color: '#FFF',
    fontWeight: 'bold',
  },

});