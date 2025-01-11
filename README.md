# ✨GL02_GLO_GOAT✨
&nbsp;
# Sujet A - Teaching Room Occupancy Management System
##### _✨Antoine MALIDOR, Guillaume ROZAND, Mathias NOTTER et Mathis RESLINGER✨_
##### Forked by CLERC Edgar, LATH Victor, ZHENG Qi

&nbsp;
### This subject is about the room occupancy system in the Sealand Republic University
##### The university specification are :
- Search for Rooms by Course
- Maximum Room Capacity
- Room Availability
- List of Available Rooms for a Given Time Slot
- iCalendar (RFC 5545) File Generation
- Data Quality Verification

## Installation

Il faut avoir Node.js installé sur sa machine.
Afin d'installer l'ensemble des dépendances, utilisez la ligne suivante :

```{bash}
npm intall
```
Ou encore celle-ci afin d'afficher le manuel pour une commande particulière :
```{bash}
node CLI.js help <commande>
```

### Exemple d'utilisation
Afin d'utiliser la commande read, nous utilisons la syntaxe suivante :
```{bash}
node CLI.js read ../src/SujetA_data/AB/edt.cru
```

# Explication de chaque fonction

## Lire et afficher le contenu du fichier
Cette commande permet de lire et d'afficher le contenu d'un fichier d'entrée. Elle affiche le nombre de créneaux, les détails de chaque créneau et les salles utilisées.

```{bash}
node CLI.js read <file>
```

## Trouver les salles associées à un cours
Cette commande permet de trouver les salles associées à un cours spécifique.

```{bash}
node CLI.js find-rooms-by-course <file> <courseId>
```

## Afficher la capacité maximale d'une salle
Cette commande permet d'afficher la capacité maximale d'une salle spécifique.

```{bash}
node CLI.js max-capacity <file> <roomName>
```

## Vérifier la disponibilité d'une salle
Cette commande permet de vérifier la disponibilité d'une salle pour une date spécifique ou pour tous les jours de la semaine.

```{bash}
node CLI.js check-availability <file> <roomName> [--date <date>]
```

## Lister les salles par créneau horaire
Cette commande permet de lister les salles disponibles ou occupées pour un jour et un créneau horaire spécifiques.

```{bash}
node CLI.js list-rooms <file> [--date <date>] [--time <time>] [--status <status>]
```

## Exporter les créneaux au format iCalendar
Cette commande permet d'exporter les créneaux au format iCalendar.

```{bash}
node CLI.js export-ical <file> <outputFile>
```

## Vérifier les conflits de planning
Cette commande permet de vérifier les conflits de planning dans le fichier d'entrée.

```{bash}
node CLI.js check-conflicts <file>
```

## Lister tous les créneaux
Cette commande permet de lister tous les créneaux présents dans le fichier d'entrée.

```{bash}
node CLI.js list-timeslots <file>
```

# Exemple d'utilisation des commandes

## Lire et afficher le contenu du fichier

```{bash}
node CLI.js read ../src/SujetA_data/AB/edt.cru
```

## Trouver les salles associées à un cours

```{bash}
node CLI.js find-rooms-by-course ../src/SujetA_data/AB/edt.cru MATH101
```
## Afficher la capacité maximale d'une salle

```{bash}
node CLI.js max-capacity ../src/SujetA_data/AB/edt.cru RoomA
```

## Vérifier la disponibilité d'une salle

```{bash}
node CLI.js check-availability ../src/SujetA_data/AB/edt.cru RoomA --date MA
```

## Lister les salles par créneau horaire

```{bash}
node CLI.js list-rooms ../src/SujetA_data/AB/edt.cru --date MA --time 10:00 --status available
```

## Exporter les créneaux au format iCalendar

```{bash}
node CLI.js export-ical ../src/SujetA_data/AB/edt.cru output.ical
```

## Vérifier les conflits de planning

```{bash}
node CLI.js check-conflicts ../src/SujetA_data/AB/edt.cru
```

## Lister tous les créneaux

```{bash}
node CLI.js list-timeslots ../src/SujetA_data/AB/edt.cru
```

