import GoalCard from '@/components/ui/GoalCard';
import React, { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import Footer from '../../components/ui/Footer';
import PetTag from '../../components/ui/PetTag';
import StatusCard from '../../components/ui/StatusCard';
import UpdatesSection from '../../components/ui/UpdatesSection';

export default function Home() {

const [selectedPet, setSelectedPet] = useState('Theo');

  return (
  <SafeAreaView style={styles.container}>

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 20 }}
    >

      {/* HEADER */}
      <View style={styles.header}>

        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.logo}
        />

        <View>
          <Text style={styles.greeting}>
            Olá, Júlia
          </Text>

          <Text style={styles.subtitle}>
            Veja as informações sobre os seus pets
          </Text>
        </View>

      </View>

      {/* ÁREA ROSA */}
      <View style={styles.petsWrapper}>
        <View style={styles.petsContainer}>

        <View style={styles.petsRow}>

          <PetTag
            name="Theo"
            selected={selectedPet === 'Theo'}
            onPress={() => setSelectedPet('Theo')}
            
          />

          <PetTag
            name="Mel"
            selected={selectedPet === 'Mel'}
            onPress={() => setSelectedPet('Mel')}
            
          />

        </View>

        <StatusCard petName={selectedPet} />
       </View>
      </View>

      <View style={styles.contentWrapper}>

  {/* ATUALIZAÇÕES */}
  <UpdatesSection />

  {/* META DE PASSEIOS */}
  <GoalCard />

</View>
    <Footer />
      
    </ScrollView>

  </SafeAreaView>
);
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F6F8',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginTop: 40,
    paddingHorizontal: 20,
  },

  logo: {
    width: 70,
    height: 70,
    resizeMode: 'contain',
    marginRight: 15,
  },

  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#8A2BE2',
  },

  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },

  petsContainer: {
   backgroundColor: '#FAD7E6',
   paddingHorizontal: 20,
   paddingVertical: 16,
  },

  petTagsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  petTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  petIcon: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
    marginRight: 5,
  },

  petTagText: {
  color: '#FFFFFF',
},

petTagTextActive: {
  color: '#7B2CBF',
  fontWeight: 'bold',
},

  newPetTag: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  newPetText: {
    color: '#8A2BE2',
    fontWeight: 'bold',
  },

  attendanceCard: {
    backgroundColor: '#F292BD',
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  attendanceTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 5,
  },

  attendanceText: {
    color: '#FFF',
  },

  arrow: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  cardLeft: {
    borderRightWidth: 2,
    borderRightColor: '#8A2BE2',
    paddingRight: 10,
    marginRight: 10,
  },

  cardDate: {
    color: '#8A2BE2',
    fontWeight: 'bold',
  },

  cardContent: {
    flex: 1,
  },

  cardText: {
    color: '#333',
    fontSize: 14,
  },

  cardArrow: {
    color: '#8A2BE2',
    fontSize: 18,
    fontWeight: 'bold',
  },

  examLink: {
    color: '#4A6CF7',
    fontWeight: 'bold',
    marginTop: 8,
  },

  footerItem: {
    alignItems: 'center',
  },

  footerIcon: {
   width: 22,
   height: 22,
   resizeMode: 'contain',
   marginBottom: 4,
  },

  footerText: {
    fontSize: 12,
    color: '#555',
  },

  footerTextActive: {
  fontSize: 12,
  color: '#F292BD',
  fontWeight: 'bold',

},

petsRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 16,
},

sectionDivider: {
  height: 1,
  backgroundColor: '#EAEAEA',
  marginVertical: 10,
},

fullWidthWrapper: {
  marginLeft: -20,
  marginRight: -20,
},

petsWrapper: {
  backgroundColor: '#FAD7E6',
},

contentWrapper: {
  paddingHorizontal: 20,
},

});