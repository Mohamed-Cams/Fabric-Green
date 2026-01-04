#!/usr/bin/env bash
# Emplacement: fabric/network/scripts/deployChaincode.sh
set -e

CC_NAME=${1:-property}
TENANT=${2:-dakar}
CC_PATH=/opt/chaincode/property
CC_VERSION=${3:-1.0}
CC_SEQUENCE=${4:-1}

echo "===> Packaging chaincode $CC_NAME version $CC_VERSION"
docker exec cli peer lifecycle chaincode package ${CC_NAME}.tar.gz \
  --path ${CC_PATH} \
  --lang node \
  --label ${CC_NAME}_${CC_VERSION}

echo "===> Installation du chaincode sur les peers"

# Install on Ministry peer
docker exec cli peer lifecycle chaincode install ${CC_NAME}.tar.gz

# Install on Notary peer
docker exec -e CORE_PEER_LOCALMSPID=NotaryMSP \
  -e CORE_PEER_ADDRESS=peer0.notary.example.com:9051 \
  -e CORE_PEER_MSPCONFIGPATH=/opt/organizations/peerOrganizations/notary.example.com/users/Admin@notary.example.com/msp \
  cli peer lifecycle chaincode install ${CC_NAME}.tar.gz

# Install on Bank peer
docker exec -e CORE_PEER_LOCALMSPID=BankMSP \
  -e CORE_PEER_ADDRESS=peer0.bank.example.com:11051 \
  -e CORE_PEER_MSPCONFIGPATH=/opt/organizations/peerOrganizations/bank.example.com/users/Admin@bank.example.com/msp \
  cli peer lifecycle chaincode install ${CC_NAME}.tar.gz

# Install on Municipality peer
docker exec -e CORE_PEER_LOCALMSPID=MunicipalityMSP \
  -e CORE_PEER_ADDRESS=peer0.municipality.example.com:13051 \
  -e CORE_PEER_MSPCONFIGPATH=/opt/organizations/peerOrganizations/municipality.example.com/users/Admin@municipality.example.com/msp \
  cli peer lifecycle chaincode install ${CC_NAME}.tar.gz

echo "===> Query installed pour récupérer package ID"
PKG_ID=$(docker exec cli peer lifecycle chaincode queryinstalled | sed -n "s/Package ID: \([^,]*\), Label: ${CC_NAME}_${CC_VERSION}/\1/p" | head -1)

if [ -z "$PKG_ID" ]; then
  echo "Erreur: Package ID non trouvé"
  exit 1
fi

echo "===> Package ID: $PKG_ID"

echo "===> Approbation pour les organisations"

# Approve for Ministry
docker exec cli peer lifecycle chaincode approveformyorg \
  -o orderer.example.com:7050 \
  --channelID channel-$TENANT \
  --name $CC_NAME \
  --version $CC_VERSION \
  --package-id $PKG_ID \
  --sequence $CC_SEQUENCE \
  --collections-config /opt/chaincode/property/collections_config.json \
  --tls \
  --cafile /opt/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

# Approve for Notary
docker exec -e CORE_PEER_LOCALMSPID=NotaryMSP \
  -e CORE_PEER_ADDRESS=peer0.notary.example.com:9051 \
  -e CORE_PEER_MSPCONFIGPATH=/opt/organizations/peerOrganizations/notary.example.com/users/Admin@notary.example.com/msp \
  cli peer lifecycle chaincode approveformyorg \
  -o orderer.example.com:7050 \
  --channelID channel-$TENANT \
  --name $CC_NAME \
  --version $CC_VERSION \
  --package-id $PKG_ID \
  --sequence $CC_SEQUENCE \
  --collections-config /opt/chaincode/property/collections_config.json \
  --tls \
  --cafile /opt/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

echo "===> Vérification de la préparation au commit"
docker exec cli peer lifecycle chaincode checkcommitreadiness \
  --channelID channel-$TENANT \
  --name $CC_NAME \
  --version $CC_VERSION \
  --sequence $CC_SEQUENCE \
  --collections-config /opt/chaincode/property/collections_config.json \
  --output json

echo "===> Commit du chaincode"
docker exec cli peer lifecycle chaincode commit \
  -o orderer.example.com:7050 \
  --channelID channel-$TENANT \
  --name $CC_NAME \
  --version $CC_VERSION \
  --sequence $CC_SEQUENCE \
  --collections-config /opt/chaincode/property/collections_config.json \
  --peerAddresses peer0.ministry.example.com:7051 \
  --tlsRootCertFiles /opt/organizations/peerOrganizations/ministry.example.com/peers/peer0.ministry.example.com/tls/ca.crt \
  --peerAddresses peer0.notary.example.com:9051 \
  --tlsRootCertFiles /opt/organizations/peerOrganizations/notary.example.com/peers/peer0.notary.example.com/tls/ca.crt \
  --tls \
  --cafile /opt/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem

echo "===> Vérification du déploiement"
docker exec cli peer lifecycle chaincode querycommitted \
  --channelID channel-$TENANT \
  --name $CC_NAME

echo "===> Chaincode $CC_NAME déployé avec succès sur channel-$TENANT"
