# npm run build:prod
# scp -i ~/.ssh/looklookat-staging-api -r dist/ looklookat-staging@40.118.188.156:/home/looklookat-staging
# scp -i ~/.ssh/looklookat-staging-api  package.json looklookat-staging@40.118.188.156:/home/looklookat-staging
# ssh -i ~/.ssh/looklookat-staging-api looklookat-staging@40.118.188.156 '
# cd /var/www/analytics_tool
# sudo rm -rf /var/www/analytics_tool/dist || true
# sudo mv /home/looklookat-staging/dist .
# sudo rm  /var/www/analytics_tool/package.json || true
# sudo mv /home/looklookat-staging/package.json .
# echo "files successfully copied"
# echo "calling npm install"
# npm install
# echo "successfully deployed the changes."
# exit'

npm run build:prod
scp -i ~/.ssh/looklookapiv3.pem -r dist/* ubuntu@3.88.45.166:~/api-staging.looklook-analysis.com/dist
# ssh -i ~/.ssh/looklookapiv3.pem ubuntu@3.88.45.166

#scp -i ~/.ssh/looklookapiv3.pem -r dist/* ubuntu@18.234.207.88:~/api-staging.looklook-analysis.com/dist
# ssh -i ~/.ssh/looklookapiv3.pem ubuntu@18.234.207.88
echo "successfully deployed the changes."