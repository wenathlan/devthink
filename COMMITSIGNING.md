# commit signing

every commit of every wave is signed with the openpgp key of this file. import it to verify the history or to keep the signing lineage after a workspace reset.

```bash
gpg --import .github/commitkey.asc
git log --show-signature
```

the signing config of the repository: user identity of the owner, commit signing always on, tag signing always on. the landing rides the verified vehicle: the wave lands on a branch, the pull request runs the battery, the squash merge signs the arrival.
