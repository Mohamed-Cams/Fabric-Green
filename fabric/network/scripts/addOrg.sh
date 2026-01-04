#!/usr/bin/env bash
# Emplacement: fabric/network/scripts/addOrg.sh
set -e

# Script squelette pour ajouter une nouvelle organisation (ex: nouvelle commune)
# Ce script doit être adapté selon votre topologie spécifique

ORG_NAME=${1}
ORG_DOMAIN=${2}

if [ -z "$ORG_NAME" ] || [ -z "$ORG_DOMAIN" ]; then
  echo "Usage: ./addOrg.sh <ORG_NAME> <ORG_DOMAIN>"
  echo "Exemple: ./addOrg.sh Rufisque rufisque.example.com"
  exit 1
fi

echo "===> Ajout d'une nouvelle organisation: $ORG_NAME ($ORG_DOMAIN)"

echo "Étapes à implémenter:"
echo "1. Générer les certificats MSP pour la nouvelle organisation"
echo "2. Créer la configuration JSON de la nouvelle organisation"
echo "3. Mettre à jour la configuration du consortium"
echo "4. Signer et soumettre la mise à jour de configuration"
echo "5. Joindre les peers de la nouvelle organisation aux canaux"
echo "6. Mettre à jour les anchor peers"

echo ""
echo "Note: Ce script est un squelette. Implémentez selon votre topologie."
echo "Référence: https://hyperledger-fabric.readthedocs.io/en/latest/channel_update_tutorial.html"
